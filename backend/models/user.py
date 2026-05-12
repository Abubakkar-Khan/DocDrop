"""
User Model — stores credentials and RSA keypair
"""
import uuid
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    public_key = db.Column(db.Text, nullable=False)    # PEM format
    certificate = db.Column(db.Text, nullable=True)    # PEM format X.509
    private_key = db.Column(db.Text, nullable=False)   # PEM format (educational only!)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    sent_documents = db.relationship(
        "Document", foreign_keys="Document.sender_id", backref="sender", lazy="dynamic"
    )
    received_documents = db.relationship(
        "Document", foreign_keys="Document.receiver_id", backref="receiver", lazy="dynamic"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_keys=False):
        data = {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_keys:
            data["public_key"] = self.public_key
            data["certificate"] = self.certificate
            data["private_key"] = self.private_key
        return data

    def __repr__(self):
        return f"<User {self.username}>"
