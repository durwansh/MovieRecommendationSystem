import sys
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

class ContentBasedTFIDFModel:
    def __init__(self, max_features=5000):
        self.max_features = max_features
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words="english",
            sublinear_tf=True,
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = None
        self.movie_id_to_idx = {}
        self.idx_to_movie_id = {}
        self.metrics = {}

    def fit(self, movies_df):
        """
        Fits the TF-IDF Vectorizer on movie metadata soup.
        """
        print(f"[TF-IDF] Vectorizing movie catalog ({len(movies_df):,} titles) with TF-IDF...")
        self.movie_id_to_idx = {mid: i for i, mid in enumerate(movies_df["movie_id"])}
        self.idx_to_movie_id = {i: mid for mid, i in self.movie_id_to_idx.items()}

        soups = movies_df["content_soup"].fillna("").tolist()
        self.tfidf_matrix = self.vectorizer.fit_transform(soups)

        vocab_size = len(self.vectorizer.vocabulary_)
        sparsity = 1.0 - (self.tfidf_matrix.nnz / (self.tfidf_matrix.shape[0] * self.tfidf_matrix.shape[1]))

        self.metrics = {
            "vocab_size": int(vocab_size),
            "matrix_shape": list(self.tfidf_matrix.shape),
            "sparsity": round(sparsity, 4)
        }
        print(f"[OK] TF-IDF Matrix Built: {self.tfidf_matrix.shape} (Vocabulary: {vocab_size:,} terms, Sparsity: {sparsity*100:.1f}%)")
        return self.metrics

    def build_user_profile_vector(self, rated_movie_ids, scores, watchlist_ids=None, preferred_genres=None):
        """
        Synthesizes a user interest vector in the latent TF-IDF feature space.
        """
        user_vec = np.zeros((1, self.tfidf_matrix.shape[1]))
        total_weight = 0.0

        # 1. Weight by user ratings (score >= 3.0)
        for mid, score in zip(rated_movie_ids, scores):
            idx = self.movie_id_to_idx.get(mid)
            if idx is not None and score >= 3.0:
                weight = float(score - 2.0)  # 3->1.0, 4->2.0, 5->3.0
                user_vec += weight * self.tfidf_matrix[idx].toarray()
                total_weight += weight

        # 2. Weight by watchlist
        if watchlist_ids:
            for mid in watchlist_ids:
                idx = self.movie_id_to_idx.get(mid)
                if idx is not None:
                    weight = 2.0
                    user_vec += weight * self.tfidf_matrix[idx].toarray()
                    total_weight += weight

        # 3. Explicit genre preferences
        if preferred_genres and len(preferred_genres) > 0:
            genre_text = " ".join(preferred_genres)
            genre_vec = self.vectorizer.transform([genre_text]).toarray()
            user_vec += 3.0 * genre_vec
            total_weight += 3.0

        if total_weight > 0:
            user_vec = user_vec / total_weight

        norm = np.linalg.norm(user_vec)
        if norm > 0:
            user_vec = user_vec / norm

        return user_vec

    def predict_similarities(self, user_vec):
        """
        Computes cosine similarity between the user profile vector and all candidate movies.
        Returns a 1D numpy array of similarity scores (0.0 - 1.0).
        """
        if user_vec is None or np.all(user_vec == 0):
            return np.zeros(self.tfidf_matrix.shape[0])

        sims = cosine_similarity(user_vec, self.tfidf_matrix).flatten()
        return np.nan_to_num(sims, nan=0.0)
