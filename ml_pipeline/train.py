import sys
import time
import json
import joblib
from datetime import datetime

# Enable UTF-8 encoding on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from .config import (
    SVD_COMPONENTS,
    TFIDF_MAX_FEATURES,
    SVD_MODEL_PATH,
    TFIDF_MODEL_PATH,
    CATALOG_PATH,
    METADATA_PATH,
    TEST_SPLIT_RATIO
)
from .data_loader import load_data
from .models.collaborative_model import CollaborativeSVDModel
from .models.content_model import ContentBasedTFIDFModel
from .models.hybrid_engine import HybridRecommender

def train():
    t0 = time.time()
    print("=" * 70)
    print("[TRAINING] AI MOVIE RECOMMENDATION ENGINE (ML PIPELINE)")
    print("=" * 70)

    # 1. Load Data
    movies_df, ratings_df, watchlist_df, users_df = load_data()

    # 2. Train Collaborative Filtering (SVD)
    print("\n--- [Step 1/3] Training Latent Factor SVD Collaborative Model ---")
    svd_model = CollaborativeSVDModel(n_components=SVD_COMPONENTS)
    svd_metrics = svd_model.fit(ratings_df, test_size=TEST_SPLIT_RATIO)

    # 3. Train Content-Based TF-IDF Model
    print("\n--- [Step 2/3] Training Content-Based TF-IDF Model ---")
    content_model = ContentBasedTFIDFModel(max_features=TFIDF_MAX_FEATURES)
    content_metrics = content_model.fit(movies_df)

    # 4. Initialize & Validate Hybrid Model
    print("\n--- [Step 3/3] Validating Hybrid Recommender on Sample User ---")
    hybrid = HybridRecommender(svd_model, content_model, movies_df)

    sample_user_id = users_df.iloc[0]["user_id"] if not users_df.empty else "sample_user"
    sample_recs = hybrid.recommend(
        sample_user_id,
        ratings_df,
        watchlist_df,
        user_info=users_df.iloc[0].to_dict() if not users_df.empty else None,
        top_k=3
    )

    print(f"\n[VALIDATION] Top Recommendations for User ({sample_user_id}):")
    for i, r in enumerate(sample_recs, 1):
        m = r["movie"]
        print(f"   [{i}] {m['title']} ({m['releaseYear']}) - {r['matchScore']}% | {r['matchType']}: {r['matchReason']}")

    # 5. Export Model Artifacts
    print("\n[EXPORT] Serializing and Exporting Model Artifacts...")
    joblib.dump(svd_model, SVD_MODEL_PATH)
    joblib.dump(content_model, TFIDF_MODEL_PATH)
    joblib.dump(movies_df, CATALOG_PATH)

    metadata = {
        "model_version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "total_movies_indexed": int(len(movies_df)),
        "total_ratings": int(len(ratings_df)),
        "total_users": int(len(users_df)),
        "collaborative_metrics": svd_metrics,
        "content_metrics": content_metrics,
        "training_duration_seconds": round(time.time() - t0, 2)
    }

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[OK] Models saved successfully to: {SVD_MODEL_PATH.parent}")
    print(f"[METRICS] Total Training Duration: {metadata['training_duration_seconds']}s")
    print("=" * 70)
    print("[DONE] MODEL TRAINING COMPLETE!")
    print("=" * 70)
    return metadata

if __name__ == "__main__":
    train()
