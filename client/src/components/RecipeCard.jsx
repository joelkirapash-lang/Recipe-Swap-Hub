import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, badge }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-fold" aria-hidden="true" />
      {badge && <span className="recipe-card-badge">{badge}</span>}
      <h3 className="recipe-card-title">{recipe.title}</h3>
      {recipe.description && <p className="recipe-card-desc">{recipe.description}</p>}
      <div className="recipe-card-footer">
        <span className="recipe-card-author">by {recipe.author_name || "Unknown"}</span>
      </div>
    </Link>
  );
}
