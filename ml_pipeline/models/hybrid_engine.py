import numpy as np
import pandas as pd
from ..config import COLLAB_WEIGHT, CONTENT_WEIGHT, BASELINE_WEIGHT

class HybridRecommender:
    def __init__(self, svd_model, content_model, movies_df):
        self.svd_model = svd_model
        self.content_model = content_model
        self.movies_df = movies_df
        self.movie_ids = movies_df["movie_id"].values
        self.avg_ratings = movies_df["averageRating"].fillna(4.0).values

    def recommend(self, user_id, user_ratings_df, user_watchlist_df, user_info=None, top_k=10):
        """
        Generates top-K hybrid recommendations for a given user.
        """
        # Filter items user already rated
        rated_ids = set()
        user_scores = []
        user_rated_mids = []

        if not user_ratings_df.empty:
            user_ratings = user_ratings_df[user_ratings_df["user_id"] == str(user_id)]
            rated_ids = set(user_ratings["movie_id"].tolist())
            user_scores = user_ratings["score"].tolist()
            user_rated_mids = user_ratings["movie_id"].tolist()

        watchlist_ids = []
        if not user_watchlist_df.empty:
            u_wl = user_watchlist_df[user_watchlist_df["user_id"] == str(user_id)]
            watchlist_ids = u_wl["movie_id"].tolist()

        preferred_genres = []
        if user_info and "preferredGenres" in user_info:
            preferred_genres = user_info["preferredGenres"] or []

        # 1. Content-based similarity calculation
        user_vec = self.content_model.build_user_profile_vector(
            user_rated_mids,
            user_scores,
            watchlist_ids=watchlist_ids,
            preferred_genres=preferred_genres
        )
        content_sims = self.content_model.predict_similarities(user_vec)

        # 2. Collaborative filtering SVD predictions
        collab_preds = self.svd_model.predict_for_user(str(user_id), self.movie_ids)
        # Normalize predicted ratings (1..5) to 0..1
        collab_norm = (collab_preds - 1.0) / 4.0

        # 3. Rating baseline (0..1)
        rating_baseline = (self.avg_ratings) / 5.0

        # 4. Hybrid weighted fusion
        hybrid_scores = (
            (COLLAB_WEIGHT * collab_norm) +
            (CONTENT_WEIGHT * content_sims) +
            (BASELINE_WEIGHT * rating_baseline)
        )

        # 5. Mask already rated movies
        candidate_indices = np.argsort(hybrid_scores)[::-1]

        recommendations = []
        for idx in candidate_indices:
            mid = self.movie_ids[idx]
            if mid in rated_ids:
                continue

            movie_row = self.movies_df.iloc[idx]
            final_score_pct = int(np.clip(hybrid_scores[idx] * 100, 65, 99))

            # Determine explainability reasoning
            c_score = content_sims[idx]
            cf_score = collab_norm[idx]

            genres = movie_row.get("genres") or ["Film"]
            first_genre = genres[0] if isinstance(genres, list) and len(genres) > 0 else "Film"

            if c_score > 0.35:
                match_type = "Content Match"
                match_reason = f"Matches your taste profile for {first_genre}"
            elif cf_score > 0.70:
                match_type = "Collaborative Pick"
                match_reason = "Highly rated by users with similar taste patterns"
            elif len(user_scores) < 2:
                match_type = "Genre Preference"
                match_reason = f"Top-rated selection in {first_genre}"
            else:
                match_type = "Hybrid AI"
                match_reason = f"Curated from your viewing patterns & {movie_row.get('averageRating', 4.5):.1f}★ baseline"

            rec_item = {
                "movie": {
                    "_id": str(movie_row["_id"]),
                    "title": movie_row["title"],
                    "genres": movie_row.get("genres", []),
                    "director": movie_row.get("director", ""),
                    "cast": movie_row.get("cast", []),
                    "releaseYear": int(movie_row.get("releaseYear", 2022)),
                    "averageRating": float(movie_row.get("averageRating", 4.0)),
                    "numRatings": int(movie_row.get("numRatings", 100)),
                    "posterUrl": movie_row.get("posterUrl", ""),
                    "bannerUrl": movie_row.get("bannerUrl", ""),
                    "industry": movie_row.get("industry", "Hollywood"),
                    "language": movie_row.get("language", "English"),
                    "description": movie_row.get("description", "")
                },
                "matchScore": final_score_pct,
                "matchReason": match_reason,
                "matchType": match_type
            }
            recommendations.append(rec_item)

            if len(recommendations) >= top_k:
                break

        return recommendations
