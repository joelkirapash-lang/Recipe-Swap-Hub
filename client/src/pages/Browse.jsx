import { useEffect, useState } from "react";
import { api } from "../api/client";
import RecipeCard from "../components/RecipeCard";

export default function Browse() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pantry match state
  const [pantryOpen, setPantryOpen] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [pantryItems, setPantryItems] = useState([]);
  const [matches, setMatches] = useState(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    api
      .listRecipes()
      .then((data) => setRecipes(data.recipes))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  function addPantryItem(e) {
    e.preventDefault();
    const value = ingredientInput.trim();
    if (value && !pantryItems.includes(value.toLowerCase())) {
      setPantryItems([...pantryItems, value.toLowerCase()]);
    }
    setIngredientInput("");
  }

  function removePantryItem(item) {
    setPantryItems(pantryItems.filter((i) => i !== item));
  }

  async function runPantryMatch() {
    if (pantryItems.length === 0) return;
    setMatching(true);
    try {
      const data = await api.pantryMatch(pantryItems);
      setMatches(data.matches);
    } catch {
      setMatches([]);
    } finally {
      setMatching(false);
    }
  }

  return (
    <div className="container page">
      <div className="recipe-detail-header">
        <div>
          <h1>Recipes</h1>
          <p style={{ color: "var(--color-text-muted)" }}>
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setPantryOpen(!pantryOpen)}
        >
          {pantryOpen ? "Close Pantry" : "Pantry Finder"}
        </button>
      </div>

      <input
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 8 }}
      />

      {pantryOpen && (
        <div className="pantry-panel">
          <h3 style={{ marginTop: 0 }}>Pantry Finder</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 12 }}>
            Add ingredients you have to find matching recipes.
          </p>
          <form onSubmit={addPantryItem} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="e.g. eggs, rice"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Add
            </button>
          </form>

          {pantryItems.length > 0 && (
            <div className="pantry-tags">
              {pantryItems.map((item) => (
                <span className="pantry-tag" key={item}>
                  {item}
                  <button
                    onClick={() => removePantryItem(item)}
                    aria-label={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={runPantryMatch}
            disabled={pantryItems.length === 0 || matching}
          >
            {matching ? "Matching..." : "Find Matches"}
          </button>

          {matches !== null && (
            <div style={{ marginTop: 20 }}>
              {matches.length === 0 ? (
                <p>No matches found. Try adding more ingredients.</p>
              ) : (
                <div className="recipe-grid">
                  {matches.map((m) => (
                    <RecipeCard
                      key={m.recipe.id}
                      recipe={m.recipe}
                      badge={
                        m.missing_count === 0
                          ? "Ready to cook!"
                          : `Missing (${m.missing_count}): ${m.missing_ingredients.join(", ")}`
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loading && <p>Loading...</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <p>No recipes found.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="recipe-grid">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
