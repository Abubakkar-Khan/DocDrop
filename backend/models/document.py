"""
Document Model — stores document metadata, hash, and signature
"""
import uuid
from datetime import datetime, timezone
from . import db


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    text_content = db.Column(db.Text, nullable=True)       # Extracted text from .docx
    hash_value = db.Column(db.String(64), nullable=True)    # SHA-256 hex digest
    signature = db.Column(db.Text, nullable=True)           # Base64 encoded RSA signature
    status = db.Column(db.String(20), default="pending")    # pending | signed | sent | verified | tampered
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "sender_username": self.sender.username if self.sender else None,
            "receiver_id": self.receiver_id,
            "receiver_username": self.receiver.username if self.receiver else None,
            "original_filename": self.original_filename,
            "text_content": self.text_content,
            "hash_value": self.hash_value,
            "signature": self.signature,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Document {self.original_filename} [{self.status}]>"
