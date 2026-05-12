import os, sqlite3, hashlib, base64, uuid, datetime
from flask import Flask, request, jsonify, render_template, send_file, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature
from docx import Document as DocxDocument

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret"
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
CORS(app)
JWTManager(app)

DB_PATH = "database.db"

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, pub_key TEXT, priv_key TEXT, cert TEXT)")
        db.execute("CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, sender_id TEXT, receiver_id TEXT, filename TEXT, content TEXT, hash TEXT, signature TEXT, status TEXT)")
        db.commit()

# --- CRYPTO LOGIC ---
def gen_keys():
    priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv_pem = priv.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption()).decode()
    pub_pem = priv.public_key().public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo).decode()
    return priv_pem, pub_pem

def gen_cert(name, priv_pem):
    priv = serialization.load_pem_private_key(priv_pem.encode(), password=None)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, name)])
    cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(priv.public_key()).serial_number(x509.random_serial_number()).not_valid_before(datetime.datetime.utcnow()).not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365)).sign(priv, hashes.SHA256())
    return cert.public_bytes(serialization.Encoding.PEM).decode()

# --- ROUTES ---
@app.route("/")
def index(): return render_template("index.html")

@app.route("/api/auth/register", methods=["POST"])
def register():
    d = request.json
    priv, pub = gen_keys()
    cert = gen_cert(d['username'], priv)
    db = get_db()
    try:
        db.execute("INSERT INTO users VALUES (?,?,?,?,?,?)", (str(uuid.uuid4()), d['username'], d['password'], pub, priv, cert))
        db.commit()
        return login()
    except: return jsonify({"error": "User exists"}), 400

@app.route("/api/auth/login", methods=["POST"])
def login():
    d = request.json
    db = get_db()
    u = db.execute("SELECT * FROM users WHERE username = ? AND password = ?", (d['username'], d['password'])).fetchone()
    if not u: return jsonify({"error": "Invalid"}), 401
    return jsonify({"access_token": create_access_token(identity=u['id']), "user": {"id": u['id'], "username": u['username']}})

@app.route("/api/auth/users")
@jwt_required()
def list_users():
    me = get_jwt_identity()
    users = get_db().execute("SELECT id, username FROM users WHERE id != ?", (me,)).fetchall()
    return jsonify({"users": [dict(u) for u in users]})

@app.route("/api/documents/upload", methods=["POST"])
@jwt_required()
def upload():
    file = request.files['file']
    path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(path)
    text = ""
    try:
        doc = DocxDocument(path)
        text = "\n".join([p.text for p in doc.paragraphs])
    except: text = "Could not extract text"
    
    doc_id = str(uuid.uuid4())
    db = get_db()
    db.execute("INSERT INTO docs (id, sender_id, filename, content, status) VALUES (?,?,?,?,?)", (doc_id, get_jwt_identity(), file.filename, text, "pending"))
    db.commit()
    return jsonify({"document": {"id": doc_id}})

@app.route("/api/documents/sign", methods=["POST"])
@jwt_required()
def sign():
    doc_id = request.json['document_id']
    me = get_jwt_identity()
    db = get_db()
    doc = db.execute("SELECT * FROM docs WHERE id = ?", (doc_id,)).fetchone()
    user = db.execute("SELECT * FROM users WHERE id = ?", (me,)).fetchone()
    
    h = hashlib.sha256(doc['content'].encode()).hexdigest()
    priv = serialization.load_pem_private_key(user['priv_key'].encode(), password=None)
    sig = priv.sign(h.encode(), padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH), hashes.SHA256())
    
    db.execute("UPDATE docs SET hash = ?, signature = ?, status = ? WHERE id = ?", (h, base64.b64encode(sig).decode(), "signed", doc_id))
    db.commit()
    return jsonify({"success": True})

@app.route("/api/documents/send", methods=["POST"])
@jwt_required()
def send():
    d = request.json
    db = get_db()
    db.execute("UPDATE docs SET receiver_id = ?, status = ? WHERE id = ?", (d['receiver_id'], "sent", d['document_id']))
    db.commit()
    return jsonify({"success": True})

@app.route("/api/documents/inbox")
@jwt_required()
def inbox():
    me = get_jwt_identity()
    db = get_db()
    docs = db.execute("SELECT docs.*, users.username as sender_username FROM docs JOIN users ON docs.sender_id = users.id WHERE receiver_id = ?", (me,)).fetchall()
    return jsonify({"documents": [dict(d) for d in docs]})

@app.route("/api/documents/<id>/download")
@jwt_required()
def download(id):
    db = get_db()
    doc = db.execute("SELECT * FROM docs WHERE id = ?", (id,)).fetchone()
    return send_file(os.path.join(app.config["UPLOAD_FOLDER"], doc['filename']), as_attachment=True)

@app.route("/api/documents/<id>/tamper", methods=["POST"])
@jwt_required()
def tamper(id):
    db = get_db()
    db.execute("UPDATE docs SET content = content || ? WHERE id = ?", ("\n[TAMPERED]", id))
    db.commit()
    return jsonify({"success": True})

@app.route("/api/crypto/verify/<id>", methods=["POST"])
@jwt_required()
def verify(id):
    db = get_db()
    doc = db.execute("SELECT docs.*, users.cert, users.username FROM docs JOIN users ON docs.sender_id = users.id WHERE docs.id = ?", (id,)).fetchone()
    
    # 1. Recompute hash
    re_h = hashlib.sha256(doc['content'].encode()).hexdigest()
    
    # 2. Extract pub key from cert
    cert = x509.load_pem_x509_certificate(doc['cert'].encode())
    pub = cert.public_key()
    
    # 3. Verify signature
    valid = False
    try:
        pub.verify(base64.b64decode(doc['signature']), doc['hash'].encode(), padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH), hashes.SHA256())
        valid = True
    except: pass
    
    match = (re_h == doc['hash'])
    return jsonify({
        "result": "verified" if (valid and match) else "tampered",
        "steps": {
            "recomputed_hash": re_h,
            "original_hash": doc['hash'],
            "hashes_match": match,
            "signature_valid": valid,
            "cert": doc['cert'],
            "sender_username": doc['username']
        }
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
