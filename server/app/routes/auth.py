from flask import Blueprint, request, jsonify, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db, bcrypt
from app.models import User

auth_bp = Blueprint("auth", __name__)


def _serializer():
    # Signs/verifies password-reset tokens using the app's secret key.
    # A token is just the user's email, signed so it can't be forged,
    # and it carries a built-in expiry (checked in reset_password below).
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are all required"}), 400

    if len(password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "an account with that email already exists"}), 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "access_token": access_token}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.to_dict(), "access_token": access_token}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.put("/me")
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "user not found"}), 404

    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    user.name = name
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    user = User.query.filter_by(email=email).first()

    # Always return 200 here even if the user doesn't exist — this is a
    # deliberate security practice so people can't use this endpoint to
    # discover which emails are registered.
    if not user:
        return jsonify({"message": "if that email is registered, a reset link has been sent"}), 200

    token = _serializer().dumps(email, salt="password-reset")

    # NOTE: no email service is wired up yet. For now the reset link is
    # returned directly in the response so you can test the flow end to
    # end. Before deploying, replace this with an actual email send (e.g.
    # Flask-Mail or an API like SendGrid) and stop returning the token/link.
    reset_link = f"/reset-password/{token}"
    current_app.logger.info(f"Password reset link for {email}: {reset_link}")

    return jsonify({
        "message": "if that email is registered, a reset link has been sent",
        "dev_reset_link": reset_link,  # remove this key once real email is wired up
    }), 200


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if len(new_password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400

    max_age = current_app.config["RESET_TOKEN_MAX_AGE_SECONDS"]
    try:
        email = _serializer().loads(token, salt="password-reset", max_age=max_age)
    except SignatureExpired:
        return jsonify({"error": "reset link has expired, please request a new one"}), 400
    except BadSignature:
        return jsonify({"error": "invalid reset link"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "user not found"}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "password updated successfully"}), 200
