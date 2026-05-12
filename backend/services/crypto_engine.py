"""
Crypto Engine — RSA-2048 + SHA-256 Digital Signature Operations

This module provides the core cryptographic functions:
  1. Key generation (RSA-2048)
  2. Hashing (SHA-256)
  3. Signing (RSA-PSS)
  4. Verification (RSA-PSS)
"""
import base64
import hashlib

from datetime import datetime, timedelta, timezone
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature


def generate_key_pair():
    """
    Generate an RSA-2048 key pair.

    Returns:
        tuple: (private_key_pem: str, public_key_pem: str)
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    return private_pem, public_pem


def generate_certificate(username: str, private_key_pem: str) -> str:
    """
    Generate a self-signed X.509 certificate for a user.

    Args:
        username: The name of the certificate holder
        private_key_pem: PEM-encoded RSA private key

    Returns:
        str: PEM-encoded X.509 certificate
    """
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode("utf-8"),
        password=None,
    )
    public_key = private_key.public_key()

    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, username),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "DocDrop Educational"),
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
    ])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        public_key
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.now(timezone.utc)
    ).not_valid_after(
        datetime.now(timezone.utc) + timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(username)]),
        critical=False,
    ).sign(private_key, hashes.SHA256())

    return cert.public_bytes(serialization.Encoding.PEM).decode("utf-8")


def hash_content(text: str) -> str:
    """
    Compute SHA-256 hash of document text content.

    Args:
        text: The document text to hash

    Returns:
        str: Hex digest of the SHA-256 hash (64 characters)
    """
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sign_hash(hash_hex: str, private_key_pem: str) -> str:
    """
    Sign a hash using RSA-PSS with the sender's private key.

    Args:
        hash_hex: The SHA-256 hex digest to sign
        private_key_pem: PEM-encoded RSA private key

    Returns:
        str: Base64-encoded signature
    """
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode("utf-8"),
        password=None,
    )

    signature = private_key.sign(
        hash_hex.encode("utf-8"),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        hashes.SHA256(),
    )

    return base64.b64encode(signature).decode("utf-8")


def verify_signature(hash_hex: str, signature_b64: str, public_key_pem: str) -> bool:
    """
    Verify an RSA-PSS signature against a hash using the sender's public key.

    Args:
        hash_hex: The SHA-256 hex digest to verify against
        signature_b64: Base64-encoded RSA signature
        public_key_pem: PEM-encoded RSA public key

    Returns:
        bool: True if signature is valid, False otherwise
    """
    try:
        if "BEGIN CERTIFICATE" in public_key_pem:
            # It's a certificate, extract the public key
            cert = x509.load_pem_x509_certificate(public_key_pem.encode("utf-8"))
            public_key = cert.public_key()
        else:
            # It's a raw public key
            public_key = serialization.load_pem_public_key(
                public_key_pem.encode("utf-8"),
            )

        signature = base64.b64decode(signature_b64)

        public_key.verify(
            signature,
            hash_hex.encode("utf-8"),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH,
            ),
            hashes.SHA256(),
        )
        return True
    except InvalidSignature:
        return False
    except Exception:
        return False
