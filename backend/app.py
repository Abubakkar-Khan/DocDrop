"""
DocDrop — Flask Application Factory

Secure Document Signing & Verification System
Educational demonstration of RSA + SHA-256 digital signatures
"""
import os
from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        seconds=app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 86400)
    )

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    # Ensure directories exist
    Config.init_app(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.documents import documents_bp
    from routes.crypto import crypto_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(crypto_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # Health check endpoint
    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "DocDrop API"}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
