"""
DocDrop Database Models
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .document import Document

__all__ = ["db", "User", "Document"]
