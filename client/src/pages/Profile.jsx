import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Profile() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listRecipes()
      .then((data) => setRecipes(data.recipes.filter((r) => r.author_id === user.id)))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="container page">
      <h1>{user.name}</h1>
      <p style={{ color: "var(--color-text-muted)" }}>{user.email}</p>

      <h2 style={{ marginTop: 40 }}>Your Recipes</h2>
      {loading && <p>Loading...</p>}
      {!loading && recipes.length === 0 && (
        <div className="empty-state">
          <p>You haven't posted any recipes yet.</p>
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
  );
}
