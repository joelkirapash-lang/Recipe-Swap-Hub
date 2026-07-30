from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Recipe, Favorite

favorites_bp = Blueprint("favorites", __name__)


@favorites_bp.get("")
@jwt_required()
def list_favorites():
    user_id = int(get_jwt_identity())
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    recipes = [f.recipe.to_dict(include_ingredients=False) for f in favorites if f.recipe]
    return jsonify({"favorites": recipes}), 200


@favorites_bp.post("/<int:recipe_id>")
@jwt_required()
def add_favorite(recipe_id):
    user_id = int(get_jwt_identity())
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404

    existing = Favorite.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
    if existing:
        return jsonify({"message": "already in favorites"}), 200

    db.session.add(Favorite(user_id=user_id, recipe_id=recipe_id))
    db.session.commit()
    return jsonify({"message": "added to favorites"}), 201


@favorites_bp.delete("/<int:recipe_id>")
@jwt_required()
def remove_favorite(recipe_id):
    user_id = int(get_jwt_identity())
    favorite = Favorite.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
    if not favorite:
        return jsonify({"error": "not in favorites"}), 404


    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "removed from favorites"}), 200
