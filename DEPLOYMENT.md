# Deployment Guide

This walks through deploying with **Render** (backend) + **Vercel**
(frontend) — both have free tiers and need no credit card for this project
size. Railway/Netlify/Heroku work almost identically if your team prefers
those instead.

**Before you start:** push this whole project to your team's shared GitHub
repo. Both Render and Vercel deploy by connecting to GitHub.

---

## Part 1: Deploy the backend (Render)

1. Go to [render.com](https://render.com) → sign up/log in → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure it:
   - **Root Directory:** `server`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app`
4. Add a database: **New +** → **PostgreSQL** (free tier). Once created, copy its
   **Internal Database URL**.
5. Back on your web service → **Environment** tab → add these variables:
   | Key | Value |
   |---|---|
   | `SECRET_KEY` | any long random string |
   | `JWT_SECRET_KEY` | a *different* long random string |
   | `DATABASE_URL` | the Postgres URL from step 4 |
   | `FRONTEND_URL` | leave blank for now — you'll add this after Part 2 |
6. Click **Create Web Service**. Render will build and deploy it — this
   takes a few minutes.
7. Once it's live, open the **Shell** tab (in Render's dashboard for your
   service) and run:
   ```bash
   flask db upgrade
   ```
   This creates all your tables on the real production database. **This step
   is easy to forget and the #1 reason a fresh deploy 500s on every request.**
8. Test it: visit `https://your-service-name.onrender.com/api/health` in a
   browser — you should see `{"status": "ok"}`.
9. Copy your Render URL (e.g. `https://recipe-swap-hub-api.onrender.com`) —
   you'll need it in Part 2.

---

## Part 2: Deploy the frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → sign up/log in → **Add New** → **Project**
2. Import the same GitHub repo
3. Configure it:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (should auto-detect)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Add an environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-render-url.onrender.com/api` (from Part 1, step 9) |
5. Click **Deploy**.
6. Once live, copy your Vercel URL (e.g. `https://recipe-swap-hub.vercel.app`).

---

## Part 3: Lock down CORS (important — don't skip)

Go back to Render → your web service → **Environment** → set:

| Key | Value |
|---|---|
| `FRONTEND_URL` | your Vercel URL from Part 2, e.g. `https://recipe-swap-hub.vercel.app` |

Save — Render will redeploy automatically. Without this step, your API
accepts requests from any website (fine for testing, not for a final
submission).

---

## Verifying the full deployed app works

1. Open your Vercel URL
2. Register a new account
3. Post a recipe
4. Log out, log back in
5. Refresh the page while on `/recipes/1` — it should **not** 404 (this is
   what `vercel.json` / `netlify.toml` fix)

If anything 500s, check Render's **Logs** tab first — almost always either
a missing environment variable or a forgotten `flask db upgrade`.

## Known limitation to mention in your submission

Password reset currently returns the reset link directly in the API
response instead of emailing it (see `server/README.md`). This is fine for
a Module 5 demo but call it out explicitly to your mentor rather than
letting them discover it — it reads much better as "known limitation,
here's how I'd fix it" than as a bug you missed.
