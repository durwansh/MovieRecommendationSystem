import sys
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import root_mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

class CollaborativeSVDModel:
    def __init__(self, n_components=10, random_state=42):
        self.n_components = n_components
        self.random_state = random_state
        self.svd = None
        self.user_to_idx = {}
        self.idx_to_user = {}
        self.movie_to_idx = {}
        self.idx_to_movie = {}
        self.user_factors = None
        self.item_factors = None
        self.global_mean = 3.8
        self.metrics = {}

    def fit(self, ratings_df, test_size=0.2):
        """
        Fits TruncatedSVD on the User-Item interaction matrix.
        Evaluates with Train-Test Split (RMSE, MAE).
        """
        if ratings_df.empty or len(ratings_df) < 5:
            print("[WARN] Insufficient rating data for SVD train split. Fitting baseline model...")
            self.global_mean = ratings_df["score"].mean() if not ratings_df.empty else 3.8
            self.metrics = {"train_rmse": 0.0, "test_rmse": 0.0, "mae": 0.0}
            return self.metrics

        self.global_mean = float(ratings_df["score"].mean())

        # Map IDs to continuous integer indices
        unique_users = ratings_df["user_id"].unique()
        unique_movies = ratings_df["movie_id"].unique()

        self.user_to_idx = {u: i for i, u in enumerate(unique_users)}
        self.idx_to_user = {i: u for u, i in self.user_to_idx.items()}
        self.movie_to_idx = {m: i for i, m in enumerate(unique_movies)}
        self.idx_to_movie = {i: m for m, i in self.movie_to_idx.items()}

        num_users = len(unique_users)
        num_movies = len(unique_movies)

        # Train/Test Split
        if len(ratings_df) >= 10:
            train_df, test_df = train_test_split(ratings_df, test_size=test_size, random_state=self.random_state)
        else:
            train_df, test_df = ratings_df, ratings_df

        # Build Sparse User-Item Matrix
        row_indices = [self.user_to_idx[u] for u in train_df["user_id"]]
        col_indices = [self.movie_to_idx[m] for m in train_df["movie_id"]]
        scores = train_df["score"].values

        R_sparse = csr_matrix((scores, (row_indices, col_indices)), shape=(num_users, num_movies))

        # Adjust components if matrix is smaller than requested components
        k = min(self.n_components, max(1, min(num_users, num_movies) - 1))
        self.svd = TruncatedSVD(n_components=k, random_state=self.random_state)
        
        # User factors (U * Sigma)
        self.user_factors = self.svd.fit_transform(R_sparse)
        # Movie factors (V^T)
        self.item_factors = self.svd.components_

        # Calculate Training & Test Metrics
        y_train_true = train_df["score"].values
        y_train_pred = [self.predict_single(r["user_id"], r["movie_id"]) for _, r in train_df.iterrows()]
        train_rmse = float(root_mean_squared_error(y_train_true, y_train_pred))

        y_test_true = test_df["score"].values
        y_test_pred = [self.predict_single(r["user_id"], r["movie_id"]) for _, r in test_df.iterrows()]
        test_rmse = float(root_mean_squared_error(y_test_true, y_test_pred))
        test_mae = float(mean_absolute_error(y_test_true, y_test_pred))

        explained_var = float(np.sum(self.svd.explained_variance_ratio_))

        self.metrics = {
            "n_users": int(num_users),
            "n_movies_rated": int(num_movies),
            "n_factors": int(k),
            "train_rmse": round(train_rmse, 4),
            "test_rmse": round(test_rmse, 4),
            "test_mae": round(test_mae, 4),
            "explained_variance_ratio": round(explained_var, 4)
        }

        print(f"[METRIC] SVD Model Trained: {k} Latent Dimensions | Test RMSE: {test_rmse:.4f} | Test MAE: {test_mae:.4f}")
        return self.metrics

    def predict_single(self, user_id, movie_id):
        """Predicts rating score for a single user-movie pair (scale 1.0 - 5.0)."""
        u_idx = self.user_to_idx.get(user_id)
        m_idx = self.movie_to_idx.get(movie_id)

        if u_idx is not None and m_idx is not None and self.user_factors is not None:
            pred = np.dot(self.user_factors[u_idx], self.item_factors[:, m_idx])
            return float(np.clip(pred, 1.0, 5.0))
        
        return self.global_mean

    def predict_for_user(self, user_id, movie_ids):
        """Predicts scores for an array of movie IDs for a user."""
        return np.array([self.predict_single(user_id, m) for m in movie_ids])
