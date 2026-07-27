import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

const BASE_SERVINGS = 4;

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [reviewData, setReviewData] = useState({ reviews: [], made_it_count: 0, swaps: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [servings, setServings] = useState(BASE_SERVINGS);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [madeIt, setMadeIt] = useState(false);
  const [swapNote, setSwapNote] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [recipeData, reviewsData] = await Promise.all([
        api.getRecipe(id),
        api.listReviews(id),
      ]);
      setRecipe(recipeData.recipe);
      setReviewData(reviewsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .listFavorites()
      .then((data) => setIsFavorited(data.favorites.some((r) => r.id === Number(id))))
      .catch(() => {});
  }, [id, isAuthenticated]);

  async function toggleFavorite() {
    setFavLoading(true);
    try {
      if (isFavorited) {
        await api.removeFavorite(id);
        setIsFavorited(false);
      } else {
        await api.addFavorite(id);
        setIsFavorited(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFavLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;
    try {
      await api.deleteRecipe(id);
      navigate("/recipes");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError("");
    setSubmittingReview(true);
    try {
      await api.createReview(id, { rating, comment, made_it: madeIt, swap_note: swapNote || null });
      setComment("");
      setSwapNote("");
      setMadeIt(false);
      setRating(5);
      const reviewsData = await api.listReviews(id);
      setReviewData(reviewsData);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <div className="page-loading">Loading recipe...</div>;
  if (error && !recipe) return <div className="container page"><div className="alert alert-error">{error}</div></div>;
  if (!recipe) return null;

  const isOwner = user && user.id === recipe.author_id;
  const scale = servings / BASE_SERVINGS;

  return (
    <div className="container page">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="recipe-detail-header">
        <div>
          <h1>{recipe.title}</h1>
          {recipe.description && <p style={{ color: "var(--color-text-muted)" }}>{recipe.description}</p>}
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            by {recipe.author_name}
            {recipe.forked_from_id && (
              <>
                {" "}
                · remixed from{" "}
                <Link to={`/recipes/${recipe.forked_from_id}`}>the original recipe</Link>
              </>
            )}
          </p>
        </div>

        <div className="recipe-detail-actions">
          {isAuthenticated && (
            <button className="btn btn-secondary btn-sm" onClick={toggleFavorite} disabled={favLoading}>
              {isFavorited ? "★ Saved" : "☆ Save to Favorites"}
            </button>
          )}
          {isAuthenticated && (
            <Link
              to="/recipes/new"
              state={{ remixFrom: recipe }}
              className="btn btn-ghost btn-sm"
            >
              Remix this recipe
            </Link>
          )}
          {isOwner && (
            <>
              <Link to={`/recipes/${id}/edit`} className="btn btn-secondary btn-sm">
                Edit
              </Link>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="serving-control">
            <span>Servings:</span>
            <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Fewer servings">
              −
            </button>
            <span>{servings}</span>
            <button onClick={() => setServings((s) => s + 1)} aria-label="More servings">
              +
            </button>
          </div>

          <ul className="ingredient-list">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id}>
                <span>{ing.name}</span>
                <span className="ingredient-qty">
                  {Number((ing.quantity * scale).toFixed(2))} {ing.unit || ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Steps</h2>
          <div className="steps-block">{recipe.steps}</div>

          <h2 style={{ marginTop: 32 }}>
            Reviews {reviewData.made_it_count > 0 && (
              <span className="made-it-tag" style={{ marginLeft: 10 }}>
                🍳 {reviewData.made_it_count} made this
              </span>
            )}
          </h2>

          {reviewData.swaps.length > 0 && (
            <div className="alert alert-success">
              <strong>Community swaps:</strong> {reviewData.swaps.join(" · ")}
            </div>
          )}

          {reviewData.reviews.length === 0 && <p>No reviews yet. Be the first to try it!</p>}

          {reviewData.reviews.map((r) => (
            <div className="review-card" key={r.id}>
              <div className="review-meta">
                <span className="review-author">{r.user_name}</span>
                <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                {r.made_it && <span className="made-it-tag">🍳 Made it</span>}
              </div>
              {r.comment && <p style={{ margin: 0 }}>{r.comment}</p>}
              {r.swap_note && <p className="swap-note">Swap: {r.swap_note}</p>}
            </div>
          ))}

          {isAuthenticated ? (
            <div className="review-card" style={{ marginTop: 20 }}>
              <h3 style={{ marginTop: 0 }}>Leave a review</h3>
              {reviewError && <div className="alert alert-error">{reviewError}</div>}
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label htmlFor="rating">Rating</label>
                  <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="comment">Comment</label>
                  <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={madeIt}
                      onChange={(e) => setMadeIt(e.target.checked)}
                      style={{ width: "auto", marginRight: 8 }}
                    />
                    I actually made this
                  </label>
                </div>
                <div className="form-group">
                  <label htmlFor="swapNote">Ingredient swap (optional)</label>
                  <input
                    id="swapNote"
                    placeholder="e.g. used honey instead of sugar"
                    value={swapNote}
                    onChange={(e) => setSwapNote(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </form>
            </div>
          ) : (
            <p>
              <Link to="/login">Log in</Link> to leave a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
