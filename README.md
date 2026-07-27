# Recipe Swap Hub

A full-stack recipe sharing app — post recipes, browse what others have
shared, save favorites, and leave reviews. Built for Module 5 Project Week.

```
recipe-swap-hub/
├── server/          # Flask REST API (see server/README.md)
├── client/          # React SPA (see client/README.md)
├── DEPLOYMENT.md    # How to deploy backend + frontend live
├── GIT_WORKFLOW.md  # How our team branches, commits, and merges
└── LICENSE
```

## Team & task split

| Person | Email | Owns | Key files |
|---|---|---|---|
| **Joel Kirapash** | joel.kirapash@student.moringaschool.com | Backend core — auth & database | `server/app/models/`, `server/app/routes/auth.py`, `server/config.py`, `server/migrations/` |
| **Lincoln Mwangi** | lincon.mwangi@student.moringaschool.com | Backend features — recipes, reviews, favorites, backend deployment | `server/app/routes/recipes.py`, `reviews.py`, `favorites.py` |
| **Abdinasir Osman** | abdinasir.osman@student.moringaschool.com | Frontend public pages | `client/src/pages/Home.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `Browse.jsx`, `client/src/components/Navbar.jsx` |
| **Vivian Wanjiku** | vivian.wanjiku@student.moringaschool.com | Frontend account pages, frontend deployment | `client/src/pages/RecipeDetail.jsx`, `RecipeForm.jsx`, `Favorites.jsx`, `Profile.jsx`, `Settings.jsx`, `client/src/components/ProtectedRoute.jsx` |

Full branching/commit/PR workflow is in **`GIT_WORKFLOW.md`**.

## Running the whole thing locally

You need both halves running at the same time, in two terminals.

**Terminal 1 — backend:**
```bash
cd server
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask db upgrade
flask run
```

**Terminal 2 — frontend:**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173.

## Deploying it live

See `DEPLOYMENT.md` for the full step-by-step guide:
- Backend → Render (owned by Lincoln)
- Frontend → Vercel (owned by Vivian)

## Project status

- ✅ Backend: auth (JWT + password reset), recipes, reviews, favorites,
  pantry-match — all requirement targets met (see `server/README.md` for
  the full tally)
- ✅ Frontend: all 12 routes, 5 protected, auth wired to the real backend,
  all 5 unique features implemented
- ✅ Deployment-ready: gunicorn, Postgres support, SPA rewrite configs
- ⬜ Actually deployed to a live URL — in progress (Lincoln: backend, Vivian: frontend)
- ⬜ Final design pass against the Figma file — in progress (Abdinasir + Vivian)

## Unique features

| Feature | What it does |
|---|---|
| Pantry Match ("What Can I Cook?") | Enter ingredients you have, get recipes you can fully make or are only missing 1–2 ingredients for |
| Recipe Remix | Fork someone else's recipe into your own version, linked back to the original |
| Serving size auto-scaling | Adjust servings and every ingredient quantity recalculates live |
| "Made It" tag | Reviewers can flag that they actually cooked it, shown as an aggregated count |
| Community ingredient swaps | Reviewers can note a substitution they made, shown as a list on the recipe |

## License

MIT — see `LICENSE`.
