import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

# Database Config
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/movie_recommendation_db")
DB_NAME = "movie_recommendation_db"

# ML Model Hyperparameters
SVD_COMPONENTS = 20            # Latent factors for Matrix Factorization
TFIDF_MAX_FEATURES = 5000      # Vocabulary size for content features
TEST_SPLIT_RATIO = 0.2         # 80/20 train/test evaluation split
RANDOM_STATE = 42

# Hybrid Fusion Weights
COLLAB_WEIGHT = 0.45
CONTENT_WEIGHT = 0.40
BASELINE_WEIGHT = 0.15

# Saved Model Paths
SVD_MODEL_PATH = ARTIFACTS_DIR / "collaborative_svd.joblib"
TFIDF_MODEL_PATH = ARTIFACTS_DIR / "content_tfidf.joblib"
CATALOG_PATH = ARTIFACTS_DIR / "movie_catalog.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"
