# Recipe Swap Hub

A full-stack recipe sharing platform where users can post recipes, browse what others have shared, save favorites, and leave reviews — built as a Module 5 team project.

**Live application:** https://recipe-swap-hub-2026.netlify.app
**API:** https://joelkirapash.pythonanywhere.com/api

## Overview

Recipe Swap Hub solves a simple, common problem: home cooks lose track of good recipes because there's no shared, structured place to keep them. The platform gives every recipe a permanent record — structured ingredients, an author, and a review history — backed by a relational database.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (single-page application, client-side routing) |
| Backend | Flask (REST API) |
| Database | SQLite (PostgreSQL-compatible) via SQLAlchemy |
| Authentication | JWT (JSON Web Tokens) |
| Frontend hosting | Netlify |
| Backend hosting | PythonAnywhere |

## Core Features

- User registration, login, and password reset flow
- Browse, search, create, edit, and delete recipes
- Structured ingredients with quantities (not free-text)
- Leave ratings and reviews on recipes
- Save recipes to a personal favorites list

## Unique Features

| Feature | Description |
|---|---|
| Pantry Match | Enter ingredients you have; see recipes you can fully make or are missing 1-2 ingredients for |
| Recipe Remix | Fork another user's recipe into your own version, linked back to the original |
| Serving size auto-scaling | Adjust servings and every ingredient quantity recalculates live |
| Made It tag | Reviewers can flag that they actually cooked the recipe |
| Community ingredient swaps | Reviewers can note a substitution they made |

## Architecture

The frontend is a React single-page application that communicates with the Flask backend through a JSON REST API, authenticated via JWT. All routes are client-side; no full-page reloads occur during navigation.

Database schema: 6 models, including two many-to-many relationships and three one-to-many relationships. API: 19 endpoints, 10 requiring authentication.

## Running Locally

Backend:

    cd server
    python3 -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    flask db upgrade
    flask run

Frontend:

    cd client
    npm install
    cp .env.example .env
    npm run dev

Then open http://localhost:5173.

## Team

| Name | Contribution |
|---|---|
| Joel Kirapash | Backend core (authentication, database models), deployment coordination |
| Lincoln Mwangi | Backend features (recipes, reviews, favorites) |
| Abdinasir Osman | Frontend public pages (Home, Login, Register, Browse) |
| Vivian Wanjiku | Frontend account pages (Recipe details, Favorites, Profile, Settings) |

## Known Limitations

- Password reset returns the reset link directly in the API response rather than sending an email, since no email service is configured. This is intentional for demo purposes.
- Recipe photo display is under active debugging.

## License

MIT — see `LICENSE`.
