"""
Crypto Routes — Verification pipeline with step-by-step data
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Document, User
from services.crypto_engine import hash_content, verify_signature

crypto_bp = Blueprint("crypto", __name__, url_prefix="/api/crypto")


@crypto_bp.route("/verify/<doc_id>", methods=["POST"])
@jwt_required()
def verify_document(doc_id):
    """
    Full verification pipeline.
    Returns step-by-step data for the crypto visualization.
    """
    user_id = get_jwt_identity()

    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    if doc.receiver_id != user_id and doc.sender_id != user_id:
        return jsonify({"error": "Access denied"}), 403

    if not doc.signature or not doc.hash_value:
        return jsonify({"error": "Document has not been signed yet"}), 400

    sender = User.query.get(doc.sender_id)
    if not sender:
        return jsonify({"error": "Sender not found"}), 404

    # === VERIFICATION PIPELINE ===

    # Step 1: Recompute hash from current document content
    recomputed_hash = hash_content(doc.text_content)

    # Step 2: Check if hashes match (content integrity)
    hashes_match = recomputed_hash == doc.hash_value

    # Step 3: Verify RSA signature (authenticity)
    # Use certificate if available, otherwise fallback to public key
    key_for_verification = sender.certificate if sender.certificate else sender.public_key
    
    signature_valid = verify_signature(
        doc.hash_value, doc.signature, key_for_verification
    )

    # Determine overall result
    if hashes_match and signature_valid:
        result = "verified"
    else:
        result = "tampered"

    # Update document status
    doc.status = result
    from models import db
    db.session.commit()

    return jsonify({
        "result": result,
        "steps": {
            # Step 1: Hashing
            "original_text": doc.text_content,
            "hash_algorithm": "SHA-256",
            "original_hash": doc.hash_value,
            "recomputed_hash": recomputed_hash,

            # Step 2: Signing info
            "sender_username": sender.username,
            "sender_public_key": sender.public_key,
            "sender_certificate": sender.certificate,
            "signature": doc.signature,
            "signature_algorithm": "RSA-PSS (2048-bit)",

            # Step 3: Transmission info
            "original_filename": doc.original_filename,
            "document_id": doc.id,

            # Step 4: Verification results
            "hashes_match": hashes_match,
            "signature_valid": signature_valid,
        },
    }), 200
