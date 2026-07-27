from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Recipe, Ingredient, RecipeIngredient

recipes_bp = Blueprint("recipes", __name__)


def _get_or_create_ingredient(name, unit=None):
    """Ingredients are shared across recipes, so we reuse an existing row
    (case-insensitive match) instead of creating duplicates like 'Egg' and
    'egg'."""
    name = name.strip()
    ingredient = Ingredient.query.filter(db.func.lower(Ingredient.name) == name.lower()).first()
    if ingredient:
        return ingredient
    ingredient = Ingredient(name=name, unit=unit)
    db.session.add(ingredient)
    db.session.flush()  # assigns ingredient.id without committing yet
    return ingredient


def _set_recipe_ingredients(recipe, ingredients_data):
    """Replaces a recipe's ingredient list. Simplest correct approach for
    a form that submits the whole ingredients list on every save."""
    RecipeIngredient.query.filter_by(recipe_id=recipe.id).delete()
    for item in ingredients_data or []:
        name = (item.get("name") or "").strip()
        quantity = item.get("quantity")
        unit = item.get("unit")
        if not name or quantity is None:
            continue
        ingredient = _get_or_create_ingredient(name, unit)
        db.session.add(RecipeIngredient(recipe_id=recipe.id, ingredient_id=ingredient.id, quantity=quantity))


@recipes_bp.get("")
def list_recipes():
    recipes = Recipe.query.order_by(Recipe.created_at.desc()).all()
    return jsonify({"recipes": [r.to_dict(include_ingredients=False) for r in recipes]}), 200


@recipes_bp.get("/<int:recipe_id>")
def get_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404
    data = recipe.to_dict()
    data["reviews"] = [r.to_dict() for r in recipe.reviews]
    return jsonify({"recipe": data}), 200


@recipes_bp.post("")
@jwt_required()
def create_recipe():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    steps = (data.get("steps") or "").strip()

    if not title or not steps:
        return jsonify({"error": "title and steps are required"}), 400

    recipe = Recipe(
        title=title,
        description=data.get("description"),
        steps=steps,
        author_id=user_id,
        forked_from_id=data.get("forked_from_id"),
    )
    db.session.add(recipe)
    db.session.flush()  # assigns recipe.id so we can attach ingredients below

    _set_recipe_ingredients(recipe, data.get("ingredients"))
    db.session.commit()

    return jsonify({"recipe": recipe.to_dict()}), 201


@recipes_bp.put("/<int:recipe_id>")
@jwt_required()
def update_recipe(recipe_id):
    user_id = int(get_jwt_identity())
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404
    if recipe.author_id != user_id:
        return jsonify({"error": "you can only edit your own recipes"}), 403

    data = request.get_json(silent=True) or {}
    if "title" in data:
        recipe.title = data["title"].strip()
    if "description" in data:
        recipe.description = data["description"]
    if "steps" in data:
        recipe.steps = data["steps"].strip()
    if "ingredients" in data:
        _set_recipe_ingredients(recipe, data["ingredients"])

    db.session.commit()
    return jsonify({"recipe": recipe.to_dict()}), 200


@recipes_bp.delete("/<int:recipe_id>")
@jwt_required()
def delete_recipe(recipe_id):
    user_id = int(get_jwt_identity())
    recipe = Recipe.query.get(recipe_id)
    if not recipe:
        return jsonify({"error": "recipe not found"}), 404
    if recipe.author_id != user_id:
        return jsonify({"error": "you can only delete your own recipes"}), 403

    db.session.delete(recipe)
    db.session.commit()
    return jsonify({"message": "recipe deleted"}), 200


@recipes_bp.post("/pantry-match")
def pantry_match():
    """Unique feature: 'What Can I Cook?'
    Given a list of ingredients the user already has, return recipes they
    can make fully, or are only missing 1-2 ingredients for."""
    data = request.get_json(silent=True) or {}
    have = {name.strip().lower() for name in data.get("ingredients", []) if name.strip()}
    max_missing = data.get("max_missing", 2)

    results = []
    for recipe in Recipe.query.all():
        needed = {ri.ingredient.name.strip().lower() for ri in recipe.recipe_ingredients if ri.ingredient}
        if not needed:
            continue
        missing = needed - have
        if len(missing) <= max_missing:
            results.append({
                "recipe": recipe.to_dict(include_ingredients=False),
                "missing_ingredients": sorted(missing),
                "missing_count": len(missing),
            })

    results.sort(key=lambda r: r["missing_count"])
    return jsonify({"matches": results}), 200
