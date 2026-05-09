"""
EduSign Configuration
"""
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "edusign-dev-secret-key-change-in-prod")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "edusign-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours (seconds)

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'edusign.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

    # Ensure directories exist
    @staticmethod
    def init_app(app):
        os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)
