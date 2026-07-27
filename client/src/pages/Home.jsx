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
          <p className="hero-eyebrow">A community cookbook</p>
          <h1>Cook from what you have. Share what you make.</h1>
          <p className="lead">
            Post your own recipes, save the ones worth repeating, and find out what you can
            cook tonight from what's already in your kitchen.
          </p>
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary">
              Browse Recipes
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Join Recipe Swap Hub
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <h2>Recently added</h2>
        {loading && <p>Loading recipes...</p>}
        {!loading && recipes.length === 0 && (
          <div className="empty-state">
            <p>No recipes yet — be the first to post one.</p>
            <Link to="/recipes/new" className="btn btn-primary">
              Post a Recipe
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
