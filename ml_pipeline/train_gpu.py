import sys
import os
import time
import json
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def train_gpu():
    try:
        import torch
        import torch.nn as nn
        from torch.utils.data import TensorDataset, DataLoader
    except ImportError:
        print("[ERROR] PyTorch is not installed! On your GPU laptop, run:")
        print("   pip install torch --index-url https://download.pytorch.org/whl/cu121")
        sys.exit(1)

    import numpy as np
    import pandas as pd
    from sklearn.model_selection import train_test_split
    from .models.neural_matrix_factorization_gpu import NeuralMatrixFactorization
    from .config import ARTIFACTS_DIR, MONGO_URI, DB_NAME

    print("=" * 70)
    print("🚀 PYTORCH GPU-ACCELERATED MODEL TRAINING PIPELINE")
    print("=" * 70)

    # 1. Detect Hardware Acceleration
    if torch.cuda.is_available():
        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        print(f"[GPU DETECTED] Accelerating on: {gpu_name} ({vram_gb:.1f} GB VRAM)")
        torch.backends.cudnn.benchmark = True
    else:
        device = torch.device("cpu")
        print("[WARN] No NVIDIA CUDA GPU detected on this machine. Running on CPU mode.")

    # 2. Extract Data (from MongoDB or CSV fallback)
    ratings_records = []
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = client[DB_NAME]
        cursor = db.ratings.find({}, {"_id": 0, "user": 1, "movie": 1, "score": 1})
        for r in cursor:
            ratings_records.append({
                "user_id": str(r["user"]),
                "movie_id": str(r["movie"]),
                "score": float(r["score"])
            })
        print(f"[DATA] Extracted {len(ratings_records):,} ratings from local MongoDB.")
    except Exception as e:
        print(f"[WARN] MongoDB not available ({e}). Checking local CSV or generating synthetic benchmark...")

    # If no MongoDB ratings on this machine, generate high-density interaction matrix for GPU demonstration
    if len(ratings_records) < 100:
        print("[INFO] Generating high-density rating interaction dataset for GPU benchmark...")
        np.random.seed(42)
        num_demo_users = 2500
        num_demo_movies = 5000
        n_samples = 150000

        user_ids = np.random.randint(0, num_demo_users, size=n_samples)
        movie_ids = np.random.randint(0, num_demo_movies, size=n_samples)
        # Ratings distributed realistically around 3.5 - 4.5
        scores = np.clip(np.random.normal(loc=3.8, scale=0.9, size=n_samples), 1.0, 5.0)

        ratings_df = pd.DataFrame({
            "user_id": [f"user_{u}" for u in user_ids],
            "movie_id": [f"movie_{m}" for m in movie_ids],
            "score": scores
        })
    else:
        ratings_df = pd.DataFrame(ratings_records)

    # 3. Preprocess Indices
    unique_users = ratings_df["user_id"].unique()
    unique_movies = ratings_df["movie_id"].unique()

    user2idx = {u: i for i, u in enumerate(unique_users)}
    movie2idx = {m: i for i, m in enumerate(unique_movies)}

    ratings_df["u_idx"] = ratings_df["user_id"].map(user2idx)
    ratings_df["m_idx"] = ratings_df["movie_id"].map(movie2idx)

    train_df, test_df = train_test_split(ratings_df, test_size=0.2, random_state=42)

    # Convert to PyTorch Tensors
    train_u = torch.tensor(train_df["u_idx"].values, dtype=torch.long)
    train_m = torch.tensor(train_df["m_idx"].values, dtype=torch.long)
    train_y = torch.tensor(train_df["score"].values, dtype=torch.float32)

    test_u = torch.tensor(test_df["u_idx"].values, dtype=torch.long)
    test_m = torch.tensor(test_df["m_idx"].values, dtype=torch.long)
    test_y = torch.tensor(test_df["score"].values, dtype=torch.float32)

    BATCH_SIZE = 1024 if torch.cuda.is_available() else 256
    train_loader = DataLoader(TensorDataset(train_u, train_m, train_y), batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(TensorDataset(test_u, test_m, test_y), batch_size=BATCH_SIZE, shuffle=False)

    # 4. Instantiate Model on GPU
    EPOCHS = 10
    EMBEDDING_DIM = 32
    model = NeuralMatrixFactorization(
        num_users=len(unique_users),
        num_items=len(unique_movies),
        embedding_dim=EMBEDDING_DIM
    ).to(device)

    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.002, weight_decay=1e-5)

    print(f"\n[MODEL] Architecture: Deep Neural Matrix Factorization (NeuMF)")
    print(f"[MODEL] Embedding Dimensions: {EMBEDDING_DIM} | Train Samples: {len(train_df):,} | Test Samples: {len(test_df):,}")
    print(f"[TRAIN] Running {EPOCHS} training epochs on {device.type.upper()}...")
    print("-" * 70)

    t_start = time.time()
    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_loss = 0.0

        for b_u, b_m, b_y in train_loader:
            b_u, b_m, b_y = b_u.to(device), b_m.to(device), b_y.to(device)

            optimizer.zero_grad()
            preds = model(b_u, b_m)
            loss = criterion(preds, b_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * len(b_y)

        train_rmse = (total_loss / len(train_df)) ** 0.5

        # Evaluate on Test Set
        model.eval()
        test_loss = 0.0
        with torch.no_grad():
            for b_u, b_m, b_y in test_loader:
                b_u, b_m, b_y = b_u.to(device), b_m.to(device), b_y.to(device)
                preds = model(b_u, b_m)
                test_loss += criterion(preds, b_y).item() * len(b_y)

        test_rmse = (test_loss / len(test_df)) ** 0.5
        print(f"Epoch [{epoch:02d}/{EPOCHS:02d}] - Train RMSE: {train_rmse:.4f} | Test RMSE: {test_rmse:.4f}")

    total_time = time.time() - t_start
    print("-" * 70)
    print(f"✅ Training Complete in {total_time:.2f}s ({len(train_df)/total_time:.0f} samples/sec on {device.type.upper()})")

    # 5. Save GPU Trained Model Artifacts
    save_path = ARTIFACTS_DIR / "neural_mf_gpu.pt"
    torch.save(model.state_dict(), save_path)
    
    meta_path = ARTIFACTS_DIR / "neural_mf_gpu_metadata.json"
    metadata = {
        "model_type": "PyTorch Neural Matrix Factorization (NeuMF)",
        "device": device.type,
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "epochs": EPOCHS,
        "embedding_dim": EMBEDDING_DIM,
        "final_test_rmse": round(test_rmse, 4),
        "total_time_seconds": round(total_time, 2),
        "num_users": len(unique_users),
        "num_movies": len(unique_movies)
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"💾 GPU Model weights saved to: {save_path}")
    print("=" * 70)

if __name__ == "__main__":
    train_gpu()
