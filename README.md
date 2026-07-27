# Recipe Swap Hub

A full-stack recipe sharing app — post recipes, browse what others have
shared, save favorites, and leave reviews. Built for Module 5 Project Week.

```
recipe-swap-hub/
├── server/   # Flask REST API (see server/README.md)
├── client/   # React SPA (see client/README.md)
└── LICENSE
```

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

## Project status

- ✅ Backend: auth (JWT + password reset), recipes, reviews, favorites,
  pantry-match — all requirement targets met (see `server/README.md` for
  the full tally)
- ✅ Frontend: all 12 routes, 5 protected, auth wired to the real backend,
  all 5 unique features implemented
- ⬜ Deployment (frontend + backend to a live URL)
- ⬜ Final design pass against the Figma file

## Team

Group [Your Group Number] — update with your team's names before submission.

## License

MIT — see `LICENSE`.
