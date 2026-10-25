import json
import joblib
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .config import SVD_MODEL_PATH, TFIDF_MODEL_PATH, CATALOG_PATH, METADATA_PATH
from .data_loader import get_db, load_data
from .models.hybrid_engine import HybridRecommender
from .train import train as run_training

# Global ML model instances in memory
ml_models = {
    "svd": None,
    "content": None,
    "catalog": None,
    "metadata": None,
    "hybrid": None
}

def load_artifacts():
    print("📦 Loading ML model artifacts into memory...")
    if not SVD_MODEL_PATH.exists() or not TFIDF_MODEL_PATH.exists():
        print("⚠️ Model artifacts missing. Auto-triggering initial training pipeline...")
        run_training()

    ml_models["svd"] = joblib.load(SVD_MODEL_PATH)
    ml_models["content"] = joblib.load(TFIDF_MODEL_PATH)
    ml_models["catalog"] = joblib.load(CATALOG_PATH)
    
    with open(METADATA_PATH, "r") as f:
        ml_models["metadata"] = json.load(f)

    ml_models["hybrid"] = HybridRecommender(
        ml_models["svd"],
        ml_models["content"],
        ml_models["catalog"]
    )
    print("✅ ML Model Service ready for high-speed inference.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()
    yield

app = FastAPI(
    title="CineAI Python ML Recommendation Service",
    description="Trained Hybrid Recommendation Pipeline (Matrix Factorization SVD + TF-IDF Cosine Similarity)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "CineAI Python ML Recommendation Engine",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_version": ml_models["metadata"].get("model_version") if ml_models["metadata"] else "unloaded",
        "trained_at": ml_models["metadata"].get("trained_at") if ml_models["metadata"] else "unknown",
        "movies_indexed": len(ml_models["catalog"]) if ml_models["catalog"] is not None else 0,
        "collaborative_metrics": ml_models["metadata"].get("collaborative_metrics") if ml_models["metadata"] else {}
    }

@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str, limit: int = Query(default=10, ge=1, le=50)):
    if ml_models["hybrid"] is None:
        raise HTTPException(status_code=503, detail="ML Models are not initialized.")

    db = get_db()
    
    # 1. Fetch user's ratings
    import pandas as pd
    from bson import ObjectId

    ratings = list(db.ratings.find({"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}))
    ratings_df = pd.DataFrame(ratings)
    if not ratings_df.empty:
        ratings_df["user_id"] = ratings_df["user"].astype(str)
        ratings_df["movie_id"] = ratings_df["movie"].astype(str)
        ratings_df["score"] = ratings_df["score"].astype(float)
    else:
        ratings_df = pd.DataFrame(columns=["user_id", "movie_id", "score"])

    # 2. Fetch user's watchlist
    watchlist = list(db.watchlists.find({"user": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id}))
    watchlist_df = pd.DataFrame(watchlist)
    if not watchlist_df.empty:
        watchlist_df["user_id"] = watchlist_df["user"].astype(str)
        watchlist_df["movie_id"] = watchlist_df["movie"].astype(str)
    else:
        watchlist_df = pd.DataFrame(columns=["user_id", "movie_id"])

    # 3. Fetch user info (preferred genres)
    user_doc = db.users.find_one({"_id": ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id})

    # 4. Generate recommendations
    recs = ml_models["hybrid"].recommend(
        user_id,
        ratings_df,
        watchlist_df,
        user_info=user_doc,
        top_k=limit
    )

    return {
        "success": True,
        "engine": "Python ML (SVD + TF-IDF Hybrid)",
        "user_id": user_id,
        "recommendations": recs
    }

@app.post("/retrain")
def trigger_retraining():
    """Triggers model training and hot-reloads models in memory."""
    meta = run_training()
    load_artifacts()
    return {
        "success": True,
        "message": "Model retrained and hot-reloaded successfully.",
        "metrics": meta
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
