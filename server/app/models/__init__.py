from datetime import datetime
from app.extensions import db


class User(db.Model):
    """A registered user. Authors many recipes, writes many reviews, and
    can favorite many recipes (via the Favorite join table)."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-many: a user authors many recipes
    recipes = db.relationship("Recipe", backref="author", lazy=True)
    # One-to-many: a user writes many reviews
    reviews = db.relationship("Review", backref="user", lazy=True)
    # A user has many favorites (join table -> many-to-many with Recipe)
    favorites = db.relationship("Favorite", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Recipe(db.Model):
    """A recipe posted by a user. Holds a many-to-many link to Ingredient
    (via RecipeIngredient) and a one-to-many link to Review."""

    __tablename__ = "recipes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    image_url = db.Column(db.String(500), nullable=True)
    steps = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique feature #2 (Recipe Remix): points back to the original recipe
    # this one was forked from. Nullable because most recipes are originals.
    forked_from_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=True)
    forked_from = db.relationship("Recipe", remote_side=[id], backref="remixes")

    # One-to-many: a recipe receives many reviews
    reviews = db.relationship("Review", backref="recipe", lazy=True, cascade="all, delete-orphan")
    # Many-to-many: Recipe <-> Ingredient, through RecipeIngredient
    recipe_ingredients = db.relationship("RecipeIngredient", backref="recipe", lazy=True, cascade="all, delete-orphan")
    # Many-to-many: Recipe <-> User (favorited by), through Favorite
    favorited_by = db.relationship("Favorite", backref="recipe", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_ingredients=True):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "steps": self.steps,
            "author_id": self.author_id,
            "author_name": self.author.name if self.author else None,
            "forked_from_id": self.forked_from_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_ingredients:
            data["ingredients"] = [ri.to_dict() for ri in self.recipe_ingredients]
        return data


class Ingredient(db.Model):
    """A reusable ingredient shared across recipes. Matched by name
    (case-insensitive) so we don't create duplicate rows like 'Egg'/'egg'."""

    __tablename__ = "ingredients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    unit = db.Column(db.String(50))

    recipe_links = db.relationship("RecipeIngredient", backref="ingredient", lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "unit": self.unit}


class RecipeIngredient(db.Model):
    """Join table implementing the Recipe <-> Ingredient many-to-many
    relationship, with an extra column (quantity) — this is why it's a
    real model and not a plain association table."""

    __tablename__ = "recipe_ingredients"

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey("ingredients.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "ingredient_id": self.ingredient_id,
            "name": self.ingredient.name if self.ingredient else None,
            "unit": self.ingredient.unit if self.ingredient else None,
            "quantity": self.quantity,
        }


class Review(db.Model):
    """A review left by a user on a recipe. Also carries our two unique
    features: made_it (the "Made It" tag) and swap_note (Community Swaps)."""

    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    # Unique feature #4 ("Made It" tag)
    made_it = db.Column(db.Boolean, default=False)
    # Unique feature #5 (Community ingredient swaps)
    swap_note = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "recipe_id": self.recipe_id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "rating": self.rating,
            "comment": self.comment,
            "made_it": self.made_it,
            "swap_note": self.swap_note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Favorite(db.Model):
    """A user's saved recipe. Join table implementing the User <-> Recipe many-to-many
    relationship (a user's saved recipes)."""

    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipes.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "recipe_id", name="uq_user_recipe_favorite"),)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "recipe_id": self.recipe_id}
