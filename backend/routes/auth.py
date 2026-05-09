"""
Authentication Routes — Register, Login, User Info
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from models import db, User
from services.crypto_engine import generate_key_pair

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and auto-generate RSA keypair."""
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password are required"}), 400

    username = data["username"].strip().lower()
    password = data["password"]

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters"}), 400
    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    # Generate RSA-2048 keypair
    private_pem, public_pem = generate_key_pair()

    # Create user
    user = User(
        username=username,
        public_key=public_pem,
        private_key=private_pem,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Auto-login: return JWT
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "user": user.to_dict(include_keys=True),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT."""
    data = request.get_json()

    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Username and password are required"}), 400

    username = data["username"].strip().lower()
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "user": user.to_dict(include_keys=True),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    """Get current authenticated user profile."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict(include_keys=True)}), 200


@auth_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    """List all users (for receiver selection dropdown)."""
    current_user_id = get_jwt_identity()
    users = User.query.filter(User.id != current_user_id).all()

    return jsonify({
        "users": [u.to_dict() for u in users]
    }), 200
