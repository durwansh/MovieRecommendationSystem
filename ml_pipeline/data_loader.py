import sys
import pandas as pd
from pymongo import MongoClient
from .config import MONGO_URI, DB_NAME

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def load_data(candidate_limit=25000):
    """
    Extracts movie metadata, user ratings, and watchlists from MongoDB.
    Uses candidate_limit for high-speed content matrix fitting on the highest-rated/popular catalog.
    """
    db = get_db()
    
    # 1. Fetch Movies
    print(f"[DATA] Extracting top {candidate_limit:,} curated movies from MongoDB...")
    movies_cursor = db.movies.find(
        {},
        {
            "_id": 1,
            "title": 1,
            "genres": 1,
            "director": 1,
            "cast": 1,
            "description": 1,
            "releaseYear": 1,
            "averageRating": 1,
            "numRatings": 1,
            "posterUrl": 1,
            "bannerUrl": 1,
            "industry": 1,
            "language": 1
        }
    ).sort([("averageRating", -1), ("numRatings", -1)]).limit(candidate_limit)

    movies = list(movies_cursor)
    movies_df = pd.DataFrame(movies)
    if movies_df.empty:
        raise ValueError("No movies found in MongoDB database! Make sure database is seeded.")

    movies_df["movie_id"] = movies_df["_id"].astype(str)

    # 2. Build Content Text Representation (Soup)
    def create_soup(row):
        genres = " ".join(row.get("genres") or []) if isinstance(row.get("genres"), list) else ""
        cast = " ".join((row.get("cast") or [])[:4]) if isinstance(row.get("cast"), list) else ""
        director = row.get("director") or ""
        desc = row.get("description") or ""
        return f"{genres} {genres} {director} {director} {cast} {desc}"

    movies_df["content_soup"] = movies_df.apply(create_soup, axis=1)

    # 3. Fetch Ratings
    print("[DATA] Extracting user ratings...")
    ratings_cursor = db.ratings.find({}, {"_id": 1, "user": 1, "movie": 1, "score": 1})
    ratings = list(ratings_cursor)
    ratings_df = pd.DataFrame(ratings)
    if not ratings_df.empty:
        ratings_df["user_id"] = ratings_df["user"].astype(str)
        ratings_df["movie_id"] = ratings_df["movie"].astype(str)
        ratings_df["score"] = ratings_df["score"].astype(float)
    else:
        ratings_df = pd.DataFrame(columns=["user_id", "movie_id", "score"])

    # 4. Fetch Watchlists
    print("[DATA] Extracting user watchlists...")
    watchlist_cursor = db.watchlists.find({}, {"_id": 1, "user": 1, "movie": 1})
    watchlist = list(watchlist_cursor)
    watchlist_df = pd.DataFrame(watchlist)
    if not watchlist_df.empty:
        watchlist_df["user_id"] = watchlist_df["user"].astype(str)
        watchlist_df["movie_id"] = watchlist_df["movie"].astype(str)
    else:
        watchlist_df = pd.DataFrame(columns=["user_id", "movie_id"])

    # 5. Fetch Users
    print("[DATA] Extracting users and preferences...")
    users_cursor = db.users.find({}, {"_id": 1, "preferredGenres": 1, "name": 1, "email": 1})
    users = list(users_cursor)
    users_df = pd.DataFrame(users)
    if not users_df.empty:
        users_df["user_id"] = users_df["_id"].astype(str)
    else:
        users_df = pd.DataFrame(columns=["user_id", "preferredGenres", "name"])

    print(f"[OK] Data extraction complete: {len(movies_df):,} movies, {len(ratings_df):,} ratings, {len(users_df):,} users.")
    return movies_df, ratings_df, watchlist_df, users_df
