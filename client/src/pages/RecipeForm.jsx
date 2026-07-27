import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

let rowIdCounter = 0;
function emptyRow() {
  return { rowId: rowIdCounter++, name: "", unit: "", quantity: "" };
}

export default function RecipeForm() {
  const { id } = useParams(); // present only on the edit route
  const isEditing = Boolean(id);
  const location = useLocation();
  const remixFrom = location.state?.remixFrom;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [rows, setRows] = useState([emptyRow()]);
  const [forkedFromId, setForkedFromId] = useState(null);

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api
        .getRecipe(id)
        .then((data) => {
          const r = data.recipe;
          setTitle(r.title);
          setDescription(r.description || "");
          setSteps(r.steps);
          setRows(
            r.ingredients.length
              ? r.ingredients.map((ing) => ({
                  rowId: rowIdCounter++,
                  name: ing.name,
                  unit: ing.unit || "",
                  quantity: ing.quantity,
                }))
              : [emptyRow()]
          );
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (remixFrom) {
      setTitle(`${remixFrom.title} (Remix)`);
      setDescription(remixFrom.description || "");
      setSteps(remixFrom.steps);
      setRows(
        (remixFrom.ingredients || []).map((ing) => ({
          rowId: rowIdCounter++,
          name: ing.name,
          unit: ing.unit || "",
          quantity: ing.quantity,
        }))
      );
      setForkedFromId(remixFrom.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function updateRow(rowId, field, value) {
    setRows(rows.map((r) => (r.rowId === rowId ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows([...rows, emptyRow()]);
  }

  function removeRow(rowId) {
    setRows(rows.filter((r) => r.rowId !== rowId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const ingredients = rows
      .filter((r) => r.name.trim() && r.quantity !== "")
      .map((r) => ({ name: r.name.trim(), unit: r.unit.trim(), quantity: Number(r.quantity) }));

    if (!title.trim() || !steps.trim()) {
      setError("Title and steps are required.");
      return;
    }
    if (ingredients.length === 0) {
      setError("Add at least one ingredient.");
      return;
    }

    const payload = { title: title.trim(), description: description.trim(), steps: steps.trim(), ingredients };
    if (forkedFromId) payload.forked_from_id = forkedFromId;

    setSubmitting(true);
    try {
      const data = isEditing ? await api.updateRecipe(id, payload) : await api.createRecipe(payload);
      navigate(`/recipes/${data.recipe.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-loading">Loading recipe...</div>;

  return (
    <div className="container page">
      <h1>{isEditing ? "Edit Recipe" : forkedFromId ? "Remix Recipe" : "Post a Recipe"}</h1>
      {forkedFromId && (
        <p style={{ color: "var(--color-text-muted)" }}>
          Starting from an existing recipe — tweak whatever you like below.
        </p>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="description">Short description</label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One line about this recipe"
          />
        </div>

        <div className="form-group">
          <label htmlFor="steps">Steps</label>
          <textarea
            id="steps"
            required
            rows={6}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={"1. Boil pasta.\n2. Melt butter with garlic.\n3. Toss together."}
          />
        </div>

        <div className="form-group">
          <label>Ingredients (for 4 servings)</label>
          {rows.map((row) => (
            <div className="ingredient-row" key={row.rowId}>
              <input
                placeholder="Name (e.g. Flour)"
                value={row.name}
                onChange={(e) => updateRow(row.rowId, "name", e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(row.rowId, "quantity", e.target.value)}
              />
              <input
                placeholder="Unit (g, cup...)"
                value={row.unit}
                onChange={(e) => updateRow(row.rowId, "unit", e.target.value)}
              />
              <button type="button" onClick={() => removeRow(row.rowId)} aria-label="Remove ingredient">
                ×
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>
            + Add ingredient
          </button>
        </div>

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditing ? "Save Changes" : "Post Recipe"}
        </button>
      </form>
    </div>
  );
}
