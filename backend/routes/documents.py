"""
Document Routes — Upload, Sign, Send, Inbox, Sent
"""
import os
import uuid

from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, User, Document
from services.crypto_engine import hash_content, sign_hash
from services.docx_service import extract_text, validate_docx

documents_bp = Blueprint("documents", __name__, url_prefix="/api/documents")


@documents_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_document():
    """Upload a .docx file and extract its text content."""
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename or not validate_docx(file.filename):
        return jsonify({"error": "Only .docx files are allowed"}), 400

    # Save file
    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}.docx"
    file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_filename)
    file.save(file_path)

    # Extract text
    try:
        text_content = extract_text(file_path)
    except Exception as e:
        os.remove(file_path)
        return jsonify({"error": f"Failed to read document: {str(e)}"}), 400

    if not text_content.strip():
        os.remove(file_path)
        return jsonify({"error": "Document appears to be empty"}), 400

    # Create document record
    doc = Document(
        id=file_id,
        sender_id=user_id,
        original_filename=file.filename,
        file_path=file_path,
        text_content=text_content,
        status="pending",
    )

    db.session.add(doc)
    db.session.commit()

    return jsonify({
        "message": "Document uploaded successfully",
        "document": doc.to_dict(),
    }), 201


@documents_bp.route("/sign", methods=["POST"])
@jwt_required()
def sign_document():
    """Sign a document: hash its content and create RSA signature."""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("document_id"):
        return jsonify({"error": "document_id is required"}), 400

    doc = Document.query.get(data["document_id"])
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    if doc.sender_id != user_id:
        return jsonify({"error": "You can only sign your own documents"}), 403

    user = User.query.get(user_id)

    # Step 1: Hash the content
    doc.hash_value = hash_content(doc.text_content)

    # Step 2: Sign the hash with sender's private key
    doc.signature = sign_hash(doc.hash_value, user.private_key)

    # Update status
    doc.status = "signed"
    db.session.commit()

    return jsonify({
        "message": "Document signed successfully",
        "document": doc.to_dict(),
        "signing_details": {
            "original_text_preview": doc.text_content[:200] + ("..." if len(doc.text_content) > 200 else ""),
            "hash_algorithm": "SHA-256",
            "hash_value": doc.hash_value,
            "signature_algorithm": "RSA-PSS (2048-bit)",
            "signature_preview": doc.signature[:80] + "...",
            "private_key_used": user.private_key[:40] + "...[MASKED]",
        },
    }), 200


@documents_bp.route("/send", methods=["POST"])
@jwt_required()
def send_document():
    """Send a signed document to a receiver."""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("document_id") or not data.get("receiver_id"):
        return jsonify({"error": "document_id and receiver_id are required"}), 400

    doc = Document.query.get(data["document_id"])
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    if doc.sender_id != user_id:
        return jsonify({"error": "You can only send your own documents"}), 403
    if doc.status not in ("signed",):
        return jsonify({"error": "Document must be signed before sending"}), 400

    receiver = User.query.get(data["receiver_id"])
    if not receiver:
        return jsonify({"error": "Receiver not found"}), 404
    if receiver.id == user_id:
        return jsonify({"error": "Cannot send document to yourself"}), 400

    doc.receiver_id = receiver.id
    doc.status = "sent"
    db.session.commit()

    return jsonify({
        "message": f"Document sent to {receiver.username}",
        "document": doc.to_dict(),
    }), 200


@documents_bp.route("/inbox", methods=["GET"])
@jwt_required()
def get_inbox():
    """Get all documents received by current user."""
    user_id = get_jwt_identity()

    documents = Document.query.filter_by(receiver_id=user_id).order_by(
        Document.created_at.desc()
    ).all()

    return jsonify({
        "documents": [doc.to_dict() for doc in documents],
    }), 200


@documents_bp.route("/sent", methods=["GET"])
@jwt_required()
def get_sent():
    """Get all documents sent by current user."""
    user_id = get_jwt_identity()

    documents = Document.query.filter_by(sender_id=user_id).order_by(
        Document.created_at.desc()
    ).all()

    return jsonify({
        "documents": [doc.to_dict() for doc in documents],
    }), 200


@documents_bp.route("/<doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    """Get a single document by ID."""
    user_id = get_jwt_identity()

    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    # Only sender or receiver can view
    if doc.sender_id != user_id and doc.receiver_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"document": doc.to_dict()}), 200


@documents_bp.route("/<doc_id>/download", methods=["GET"])
@jwt_required()
def download_document(doc_id):
    """Download the original .docx file."""
    user_id = get_jwt_identity()

    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    if doc.sender_id != user_id and doc.receiver_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if not os.path.exists(doc.file_path):
        return jsonify({"error": "File not found on disk"}), 404

    return send_file(
        doc.file_path,
        as_attachment=True,
        download_name=doc.original_filename,
    )


@documents_bp.route("/<doc_id>/tamper", methods=["POST"])
@jwt_required()
def tamper_document(doc_id):
    """
    EDUCATIONAL FEATURE: Tamper with a document's content after signing.
    This demonstrates what happens when a document is modified post-signature.
    """
    user_id = get_jwt_identity()

    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    if doc.sender_id != user_id and doc.receiver_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    # Tamper: append text to content (hash will no longer match)
    original_text = doc.text_content
    doc.text_content = doc.text_content + "\n[TAMPERED — This text was added after signing!]"
    db.session.commit()

    return jsonify({
        "message": "Document has been tampered with! The verification will now fail.",
        "original_preview": original_text[:100] + "...",
        "tampered_preview": doc.text_content[:150] + "...",
        "document": doc.to_dict(),
    }), 200
