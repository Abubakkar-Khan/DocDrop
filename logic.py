import os, sqlite3, hashlib, base64, uuid, datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature
from docx import Document as DocxDocument

DB_PATH = "database.db"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class DocDropLogic:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_db()

    def init_db(self):
        self.conn.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, pub_key TEXT, priv_key TEXT, cert TEXT)")
        self.conn.execute("CREATE TABLE IF NOT EXISTS docs (id TEXT PRIMARY KEY, sender_id TEXT, receiver_id TEXT, filename TEXT, content TEXT, hash TEXT, signature TEXT, status TEXT)")
        self.conn.commit()

    # --- AUTH ---
    def register(self, username, password):
        priv, pub = self.gen_keys()
        cert = self.gen_cert(username, priv)
        try:
            user_id = str(uuid.uuid4())
            self.conn.execute("INSERT INTO users VALUES (?,?,?,?,?,?)", (user_id, username, password, pub, priv, cert))
            self.conn.commit()
            return {"id": user_id, "username": username}
        except Exception as e:
            raise Exception("User already exists or database error")

    def login(self, username, password):
        u = self.conn.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password)).fetchone()
        if not u:
            raise Exception("Invalid username or password")
        return dict(u)

    def get_users(self, exclude_id):
        users = self.conn.execute("SELECT id, username FROM users WHERE id != ?", (exclude_id,)).fetchall()
        return [dict(u) for u in users]

    # --- CRYPTO ---
    def gen_keys(self):
        priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        priv_pem = priv.private_bytes(encoding=serialization.Encoding.PEM, format=serialization.PrivateFormat.PKCS8, encryption_algorithm=serialization.NoEncryption()).decode()
        pub_pem = priv.public_key().public_bytes(encoding=serialization.Encoding.PEM, format=serialization.PublicFormat.SubjectPublicKeyInfo).decode()
        return priv_pem, pub_pem

    def gen_cert(self, name, priv_pem):
        priv = serialization.load_pem_private_key(priv_pem.encode(), password=None)
        subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, name)])
        cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(priv.public_key()).serial_number(x509.random_serial_number()).not_valid_before(datetime.datetime.utcnow()).not_valid_after(datetime.datetime.utcnow() + datetime.timedelta(days=365)).sign(priv, hashes.SHA256())
        return cert.public_bytes(serialization.Encoding.PEM).decode()

    # --- DOCUMENTS ---
    def upload_doc(self, file_path, sender_id):
        filename = os.path.basename(file_path)
        dest_path = os.path.join(UPLOAD_FOLDER, filename)
        # In TUI, we might just use the path or copy it
        import shutil
        shutil.copy(file_path, dest_path)
        
        text = ""
        try:
            doc = DocxDocument(dest_path)
            text = "\n".join([p.text for p in doc.paragraphs])
        except:
            text = "Could not extract text"
        
        doc_id = str(uuid.uuid4())
        self.conn.execute("INSERT INTO docs (id, sender_id, filename, content, status) VALUES (?,?,?,?,?)", (doc_id, sender_id, filename, text, "pending"))
        self.conn.commit()
        return doc_id

    def sign_doc(self, doc_id, user_id):
        doc = self.conn.execute("SELECT * FROM docs WHERE id = ?", (doc_id,)).fetchone()
        user = self.conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        
        h = hashlib.sha256(doc['content'].encode()).hexdigest()
        priv = serialization.load_pem_private_key(user['priv_key'].encode(), password=None)
        sig = priv.sign(h.encode(), padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH), hashes.SHA256())
        
        self.conn.execute("UPDATE docs SET hash = ?, signature = ?, status = ? WHERE id = ?", (h, base64.b64encode(sig).decode(), "signed", doc_id))
        self.conn.commit()
        return h

    def send_doc(self, doc_id, receiver_id):
        self.conn.execute("UPDATE docs SET receiver_id = ?, status = ? WHERE id = ?", (receiver_id, "sent", doc_id))
        self.conn.commit()

    def get_inbox(self, receiver_id):
        docs = self.conn.execute("SELECT docs.*, users.username as sender_username FROM docs JOIN users ON docs.sender_id = users.id WHERE receiver_id = ?", (receiver_id,)).fetchall()
        return [dict(d) for d in docs]

    def tamper_doc(self, doc_id):
        self.conn.execute("UPDATE docs SET content = content || ? WHERE id = ?", ("\n[TAMPERED]", doc_id))
        self.conn.commit()

    def verify_doc(self, doc_id):
        doc = self.conn.execute("SELECT docs.*, users.cert, users.username FROM docs JOIN users ON docs.sender_id = users.id WHERE docs.id = ?", (doc_id,)).fetchone()
        
        re_h = hashlib.sha256(doc['content'].encode()).hexdigest()
        cert = x509.load_pem_x509_certificate(doc['cert'].encode())
        pub = cert.public_key()
        
        valid = False
        try:
            pub.verify(base64.b64decode(doc['signature']), doc['hash'].encode(), padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH), hashes.SHA256())
            valid = True
        except: pass
        
        match = (re_h == doc['hash'])
        return {
            "result": "verified" if (valid and match) else "tampered",
            "steps": {
                "recomputed_hash": re_h,
                "original_hash": doc['hash'],
                "hashes_match": match,
                "signature_valid": valid,
                "cert": doc['cert'],
                "sender_username": doc['username']
            }
        }
