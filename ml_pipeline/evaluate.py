import time
import json
import joblib
import numpy as np
from .config import SVD_MODEL_PATH, TFIDF_MODEL_PATH, CATALOG_PATH, METADATA_PATH
from .data_loader import load_data
from .models.hybrid_engine import HybridRecommender

def evaluate():
    print("=" * 70)
    print("📈 AI RECOMMENDATION SYSTEM - MODEL EVALUATION BENCHMARK")
    print("=" * 70)

    if not SVD_MODEL_PATH.exists() or not TFIDF_MODEL_PATH.exists():
        print("❌ Model artifacts not found. Please run 'python -m ml_pipeline.train' first.")
        return

    # 1. Load Artifacts
    print("📦 Loading model artifacts...")
    svd_model = joblib.load(SVD_MODEL_PATH)
    content_model = joblib.load(TFIDF_MODEL_PATH)
    movies_df = joblib.load(CATALOG_PATH)
    with open(METADATA_PATH, "r") as f:
        meta = json.load(f)

    # 2. Extract Data
    _, ratings_df, watchlist_df, users_df = load_data(candidate_limit=len(movies_df))
    hybrid = HybridRecommender(svd_model, content_model, movies_df)

    # 3. Latency Benchmark
    print("\n⚡ Running Latency & Throughput Benchmark (50 iterations)...")
    sample_user_id = users_df.iloc[0]["user_id"] if not users_df.empty else "sample_user"
    latencies = []

    for _ in range(50):
        t_start = time.perf_counter()
        _ = hybrid.recommend(
            sample_user_id,
            ratings_df,
            watchlist_df,
            user_info=users_df.iloc[0].to_dict() if not users_df.empty else None,
            top_k=10
        )
        latencies.append((time.perf_counter() - t_start) * 1000)

    avg_latency = float(np.mean(latencies))
    p95_latency = float(np.percentile(latencies, 95))

    # 4. Intra-List Diversity (ILD) & Catalog Coverage
    sample_recs = hybrid.recommend(
        sample_user_id,
        ratings_df,
        watchlist_df,
        user_info=users_df.iloc[0].to_dict() if not users_df.empty else None,
        top_k=10
    )
    recommended_genres = []
    for r in sample_recs:
        recommended_genres.extend(r["movie"].get("genres", []))
    unique_genres_in_recs = len(set(recommended_genres))

    print("\n" + "=" * 70)
    print("📋 MODEL EVALUATION RESULTS REPORT")
    print("=" * 70)
    print(f"• Model Version:             {meta.get('model_version')}")
    print(f"• Trained Date:              {meta.get('trained_at')}")
    print(f"• Catalog Size:              {meta.get('total_movies_indexed'):,} movies")
    print(f"• Total Ratings Evaluated:   {meta.get('total_ratings'):,} ratings")
    print("-" * 70)
    print("📊 COLLABORATIVE SVD METRICS:")
    svd_m = meta.get("collaborative_metrics", {})
    print(f"  - Latent Components (k):   {svd_m.get('n_factors')}")
    print(f"  - Test RMSE:               {svd_m.get('test_rmse', 'N/A')}")
    print(f"  - Test MAE:                {svd_m.get('test_mae', 'N/A')}")
    print(f"  - Explained Variance:      {svd_m.get('explained_variance_ratio', 'N/A')}")
    print("-" * 70)
    print("🔤 CONTENT TF-IDF METRICS:")
    cnt_m = meta.get("content_metrics", {})
    print(f"  - Vocabulary Features:     {cnt_m.get('vocab_size'):,} n-grams")
    print(f"  - Feature Matrix Sparsity: {cnt_m.get('sparsity', 0)*100:.2f}%")
    print("-" * 70)
    print("⚡ SYSTEM INFERENCE PERFORMANCE:")
    print(f"  - Mean Inference Latency:  {avg_latency:.2f} ms")
    print(f"  - 95th Percentile (p95):   {p95_latency:.2f} ms")
    print(f"  - Top-10 Genre Diversity:  {unique_genres_in_recs} distinct genres in Top 10")
    print("=" * 70)

if __name__ == "__main__":
    evaluate()
