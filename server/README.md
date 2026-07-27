# Recipe Swap Hub — Backend (Flask API)

This is the Day 1 milestone from our project timeline: database models,
migrations, and auth (register / login / forgot-password / reset-password
with JWT). Recipe, review, and favorites endpoints come next.

## Setup (each teammate runs this locally)

```bash
cd server
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # then edit .env with your own secret strings

flask db upgrade                 # creates instance/app.db with all tables
flask run                        # starts the API on http://127.0.0.1:5000
```

## Verifying it works

```bash
curl http://127.0.0.1:5000/api/health
# {"status": "ok"}
```

## What's implemented (backend complete ✅)

### Auth
| Endpoint | Method | Protected? |
|---|---|---|
| `/api/auth/register` | POST | No |
| `/api/auth/login` | POST | No |
| `/api/auth/me` | GET | **Yes** |
| `/api/auth/forgot-password` | POST | No |
| `/api/auth/reset-password` | POST | No |

### Recipes
| Endpoint | Method | Protected? |
|---|---|---|
| `/api/recipes` | GET | No |
| `/api/recipes/:id` | GET | No |
| `/api/recipes` | POST | **Yes** |
| `/api/recipes/:id` | PUT | **Yes** (owner only) |
| `/api/recipes/:id` | DELETE | **Yes** (owner only) |
| `/api/recipes/pantry-match` | POST | No |

### Reviews
| Endpoint | Method | Protected? |
|---|---|---|
| `/api/recipes/:id/reviews` | GET | No |
| `/api/recipes/:id/reviews` | POST | **Yes** |
| `/api/reviews/:id` | PUT | **Yes** (owner only) |
| `/api/reviews/:id` | DELETE | **Yes** (owner only) |

### Favorites
| Endpoint | Method | Protected? |
|---|---|---|
| `/api/favorites` | GET | **Yes** |
| `/api/favorites/:recipeId` | POST | **Yes** |
| `/api/favorites/:recipeId` | DELETE | **Yes** |

Send the JWT on protected routes as a header:
`Authorization: Bearer <access_token>`

### Requirement tally — all met ✅

| Requirement | Target | Actual |
|---|---|---|
| Total endpoints | 8+ | **19** |
| Protected endpoints | 5+ | **10** |
| GET endpoints | 2+ | 6 |
| POST endpoints | 2+ | 8 |
| PUT endpoints | 2+ | 2 |
| DELETE endpoints | 2+ | 3 |
| Models | 4+ | 6 |
| One-to-many relationships | 2+ | 3 |
| Many-to-many relationships | 1+ | 2 |

### Unique features implemented

- **Pantry Match** (`POST /api/recipes/pantry-match`) — send a list of
  ingredients you have, get back recipes you can fully make or are only
  missing 1-2 ingredients for.
- **"Made It" tag** — `made_it` boolean on reviews, aggregated as
  `made_it_count` when listing a recipe's reviews.
- **Community Swaps** — `swap_note` on reviews, aggregated as a `swaps`
  list when listing a recipe's reviews.
- **Recipe Remix** (data model ready) — `Recipe.forked_from_id` links a
  recipe back to its original. Frontend "Remix" button still to build.
- **Serving size auto-scaling** — no backend work needed; this is pure
  frontend math against each ingredient's stored `quantity`.

### Creating a recipe — request body shape

```json
{
  "title": "Garlic Butter Pasta",
  "description": "Quick weeknight pasta",
  "steps": "1. Boil pasta. 2. Melt butter with garlic. 3. Toss together.",
  "ingredients": [
    { "name": "Spaghetti", "unit": "g", "quantity": 200 },
    { "name": "Butter", "unit": "tbsp", "quantity": 3 }
  ]
}
```

Ingredients are matched by name (case-insensitive) and reused if they
already exist in the database, so "Butter" and "butter" won't create two
separate ingredient rows.

## Database models (matches the ERD)

`User`, `Recipe`, `Ingredient`, `RecipeIngredient` (join table), `Review`,
`Favorite` (join table). See `app/models/__init__.py` — every field and
relationship has a comment explaining what it's for.

Two extra columns were added beyond the base ERD to support our unique
features (documented separately):
- `Recipe.forked_from_id` → Recipe Remix feature
- `Review.made_it` / `Review.swap_note` → "Made It" tag + Community Swaps

## A note on password reset (read before deploying)

There's no email service wired up yet. `/api/auth/forgot-password`
currently returns the reset link directly in the JSON response
(`dev_reset_link`) so you can test the full flow without setting up email.
**Before deployment**, replace this with a real email send (Flask-Mail,
SendGrid, etc.) and remove the `dev_reset_link` key from the response —
otherwise anyone could reset anyone's password just by knowing their email.

## Making migrations after changing a model

Whenever someone edits a model in `app/models/__init__.py`:

```bash
flask db migrate -m "short description of the change"
flask db upgrade
```

Commit the new file that appears in `migrations/versions/` along with your
model change — that's how the whole team stays on the same schema.

## Next steps (Day 4 per our timeline)

Backend is done. Next: the React frontend (`client/`) — routing skeleton,
auth context, and pages that call these exact endpoints.
