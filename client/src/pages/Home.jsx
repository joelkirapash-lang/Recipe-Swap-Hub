import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import RecipeCard from "../components/RecipeCard";
export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listRecipes()
      .then((data) => setRecipes(data.recipes.slice(0, 6)))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="app-shell-content">
      <section className="hero">
        <div className="container">
          <p className="hero-eyebrow">Your community kitchen hub</p>
          <h2>
            Cook with what’s on hand, save your go-to meals, and share what you
            make.
          </h2>
          <p className="lead">
            Turn pantry staples into tonight’s dinner and organize your favorite
            dishes all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary">
              Explore Recipes
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <h2>Freshly Shared</h2>
        {loading && <p>Gathering recipes...</p>}
        {!loading && recipes.length === 0 && (
          <div className="empty-state">
            <p>
              No recipes added yet — kick off the collection by sharing yours!
            </p>
            <Link to="/recipes/new" className="btn btn-primary">
              Share a Recipe
            </Link>
          </div>
        )}
        {!loading && recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
