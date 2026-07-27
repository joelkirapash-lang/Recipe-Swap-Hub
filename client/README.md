# Recipe Swap Hub — Frontend (React SPA)

## Setup

```bash
cd client
npm install
cp .env.example .env      # points at your local backend by default
npm run dev                # starts on http://localhost:5173
```

Make sure the backend (`../server`) is running on `http://127.0.0.1:5000`
first — see its README for setup.

## Routes (12 total, 5 protected)

| Route | Page | Protected? |
|---|---|---|
| `/` | Home | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/forgot-password` | Request password reset | No |
| `/reset-password/:token` | Set new password | No |
| `/recipes` | Browse (includes Pantry Match panel) | No |
| `/recipes/:id` | Recipe detail | No |
| `/recipes/new` | Create a recipe (also handles Remix) | **Yes** |
| `/recipes/:id/edit` | Edit your own recipe | **Yes** |
| `/favorites` | Your saved recipes | **Yes** |
| `/profile` | Your posted recipes | **Yes** |
| `/settings` | Update your name | **Yes** |

Routing is entirely client-side (`react-router-dom`, `BrowserRouter`) — this
is a true single-page app, no full-page reloads.

## How auth works here

- `src/context/AuthContext.jsx` holds the logged-in user and JWT.
- The JWT is stored in `localStorage` so a refresh doesn't log you out.
- `src/components/ProtectedRoute.jsx` wraps the 5 protected routes — if
  you're not logged in, it redirects to `/login` and remembers where you
  were headed, so you land back there after logging in.
- `src/api/client.js` is the single place every API call goes through —
  it attaches `Authorization: Bearer <token>` automatically when `auth: true`
  is passed.

## Where each unique feature lives

| Feature | Where |
|---|---|
| Pantry Match ("What Can I Cook?") | `src/pages/Browse.jsx` |
| Recipe Remix | "Remix this recipe" button in `RecipeDetail.jsx` → pre-fills `RecipeForm.jsx` |
| Serving size auto-scaling | `src/pages/RecipeDetail.jsx` (`servings` state scales every ingredient quantity live) |
| "Made It" tag | Checkbox in the review form, aggregated count shown on `RecipeDetail.jsx` |
| Community ingredient swaps | Optional field in the review form, listed under "Community swaps" |

## Design system

Colors, fonts, and spacing are defined as CSS variables at the top of
`src/index.css` — change the palette or type in one place and it updates
everywhere.

## Building for deployment

```bash
npm run build
```

Outputs a static `dist/` folder — deploy this to Vercel or Netlify.
Before deploying, set `VITE_API_URL` in your hosting platform's environment
variables to your deployed backend's URL (not `127.0.0.1`).
