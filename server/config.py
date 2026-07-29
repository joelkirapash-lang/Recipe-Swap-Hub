import os
from datetime import timedelta
from dotenv import load_dotenv

# Load variables from a .env file in this same folder, if present
load_dotenv()


class Config:
    # Used by Flask to sign session cookies, etc.
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # Where the database lives. Defaults to a local SQLite file stored in
    # Flask's instance/ folder (auto-created, already in .gitignore) so you
    # can run this immediately with zero setup. Swap DATABASE_URL in .env
    # for Postgres once you deploy (e.g. postgresql://user:pass@host/dbname).
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT (auth token) settings
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # 30 minutes balances security (a short-lived token limits damage if
    # the reset link leaks) against usability (enough time to check email
    # and click it). Increase this if users report links expiring too fast.
    RESET_TOKEN_MAX_AGE_SECONDS = 1800
