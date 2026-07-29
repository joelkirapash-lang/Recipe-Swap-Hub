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
          <p className="hero-eyebrow">Community Cookbook</p>
          <h2>Cook what you have. Share what you make.</h2>
          <p className="lead">
            Find recipes, save favorites, and cook with your pantry.
          </p>
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary">
              Explore
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      <div className="container page">
        <h2>Latest Recipes</h2>
        {loading && <p>Loading...</p>}
        {!loading && recipes.length === 0 && (
          <div className="empty-state">
            <p>No recipes yet. Share the first one!</p>
            <Link to="/recipes/new" className="btn btn-primary">
              Add Recipe
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
