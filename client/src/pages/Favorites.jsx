import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listFavorites()
      .then((data) => setFavorites(data.favorites))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <h1>Your Favorites</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && favorites.length === 0 && (
        <div className="empty-state">
          <p>You haven't saved any recipes yet.</p>
          <Link to="/recipes" className="btn btn-primary">
            Browse Recipes
          </Link>
        </div>
      )}
      {!loading && favorites.length > 0 && (
        <div className="recipe-grid">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
