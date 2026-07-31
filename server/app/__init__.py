from flask import Flask
from config import Config
from app.extensions import db, migrate, jwt, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Bind extensions to this app instance
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    # allow the React dev server (usually localhost:5173 or :3000) to call this API
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})

    # Import models so Flask-Migrate can detect them for migrations
    from app import models  # noqa: F401

    # Register route blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from app.routes.recipes import recipes_bp
    app.register_blueprint(recipes_bp, url_prefix="/api/recipes")

    from app.routes.reviews import reviews_bp
    app.register_blueprint(reviews_bp, url_prefix="/api")

    from app.routes.favorites import favorites_bp
    app.register_blueprint(favorites_bp, url_prefix="/api/favorites")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
