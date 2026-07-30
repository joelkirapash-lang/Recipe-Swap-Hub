from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Recipe, Review

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.get("/recipes/<int:recipe_id>/reviews")
def list_reviews(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404

    reviews = Review.query.filter_by(recipe_id=recipe_id).order_by(Review.created_at.desc()).all()
    made_it_count = Review.query.filter_by(recipe_id=recipe_id, made_it=True).count()

    return jsonify({
        "reviews": [r.to_dict() for r in reviews],
        "made_it_count": made_it_count,          # unique feature #4
        "swaps": [r.swap_note for r in reviews if r.swap_note],  # unique feature #5
    }), 200


@reviews_bp.post("/recipes/<int:recipe_id>/reviews")
@jwt_required()
def create_review(recipe_id):
    user_id = int(get_jwt_identity())
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404

    data = request.get_json(silent=True) or {}
    rating = data.get("rating")
    if not isinstance(rating, int) or not (1 <= rating <= 5):
        return jsonify({"error": "rating must be an integer from 1 to 5"}), 400

    review = Review(
        recipe_id=recipe_id,
        user_id=user_id,
        rating=rating,
        comment=data.get("comment"),
        made_it=bool(data.get("made_it", False)),
        swap_note=data.get("swap_note"),
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({"review": review.to_dict()}), 201


@reviews_bp.put("/reviews/<int:review_id>")
@jwt_required()
def update_review(review_id):
    user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "review not found"}), 404
    if review.user_id != user_id:
        return jsonify({"error": "you can only edit your own reviews"}), 403

    data = request.get_json(silent=True) or {}
    if "rating" in data:
        rating = data["rating"]
        if not isinstance(rating, int) or not (1 <= rating <= 5):
            return jsonify({"error": "rating must be an integer from 1 to 5"}), 400
        review.rating = rating
    if "comment" in data:
        review.comment = data["comment"]
    if "made_it" in data:
        review.made_it = bool(data["made_it"])
    if "swap_note" in data:
        review.swap_note = data["swap_note"]

    db.session.commit()
    return jsonify({"review": review.to_dict()}), 200



@reviews_bp.delete("/reviews/<int:review_id>")
@jwt_required()
def delete_review(review_id):
    user_id = int(get_jwt_identity())
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "review not found"}), 404
    if review.user_id != user_id:
        return jsonify({"error": "you can only delete your own reviews"}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "review deleted"}), 200
