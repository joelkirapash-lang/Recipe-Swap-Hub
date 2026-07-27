const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

function getToken() {
  return localStorage.getItem("recipe_swap_hub_token");
}

/**
 * Core request helper. Every page-level API call in this app goes through
 * this function, so auth headers and error handling live in exactly one
 * place instead of being copy-pasted into every component.
 */
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // some endpoints (rare) might not return a JSON body
  }

  if (!response.ok) {
    const message = (data && data.error) || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me", { auth: true }),
  updateProfile: (name) => request("/auth/me", { method: "PUT", body: { name }, auth: true }),
  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, new_password) =>
    request("/auth/reset-password", { method: "POST", body: { token, new_password } }),

  // Recipes
  listRecipes: () => request("/recipes"),
  getRecipe: (id) => request(`/recipes/${id}`),
  createRecipe: (payload) => request("/recipes", { method: "POST", body: payload, auth: true }),
  updateRecipe: (id, payload) => request(`/recipes/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteRecipe: (id) => request(`/recipes/${id}`, { method: "DELETE", auth: true }),
  pantryMatch: (ingredients) =>
    request("/recipes/pantry-match", { method: "POST", body: { ingredients } }),

  // Reviews
  listReviews: (recipeId) => request(`/recipes/${recipeId}/reviews`),
  createReview: (recipeId, payload) =>
    request(`/recipes/${recipeId}/reviews`, { method: "POST", body: payload, auth: true }),
  updateReview: (reviewId, payload) =>
    request(`/reviews/${reviewId}`, { method: "PUT", body: payload, auth: true }),
  deleteReview: (reviewId) => request(`/reviews/${reviewId}`, { method: "DELETE", auth: true }),

  // Favorites
  listFavorites: () => request("/favorites", { auth: true }),
  addFavorite: (recipeId) => request(`/favorites/${recipeId}`, { method: "POST", auth: true }),
  removeFavorite: (recipeId) => request(`/favorites/${recipeId}`, { method: "DELETE", auth: true }),
};

export function saveToken(token) {
  localStorage.setItem("recipe_swap_hub_token", token);
}

export function clearToken() {
  localStorage.removeItem("recipe_swap_hub_token");
}

export { getToken };
