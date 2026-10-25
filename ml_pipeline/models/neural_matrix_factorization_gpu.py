import sys
try:
    import torch
    import torch.nn as nn
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

if HAS_TORCH:
    class NeuralMatrixFactorization(nn.Module):
        """
        Deep Neural Matrix Factorization (NeuMF) architecture.
        Combines Generalized Matrix Factorization (GMF) with Multi-Layer Perceptron (MLP)
        for non-linear user-item interaction modeling.
        """
        def __init__(self, num_users, num_items, embedding_dim=32, mlp_hidden_dims=[64, 32, 16], dropout_rate=0.2):
            super().__init__()
            self.num_users = num_users
            self.num_items = num_items
            self.embedding_dim = embedding_dim

            # 1. GMF (Generalized Matrix Factorization) Embeddings
            self.user_embed_gmf = nn.Embedding(num_users, embedding_dim)
            self.item_embed_gmf = nn.Embedding(num_items, embedding_dim)

            # 2. MLP Embeddings
            self.user_embed_mlp = nn.Embedding(num_users, embedding_dim)
            self.item_embed_mlp = nn.Embedding(num_items, embedding_dim)

            # 3. Deep MLP Dense Layers
            mlp_layers = []
            in_dim = embedding_dim * 2
            for hidden_dim in mlp_hidden_dims:
                mlp_layers.append(nn.Linear(in_dim, hidden_dim))
                mlp_layers.append(nn.BatchNorm1d(hidden_dim))
                mlp_layers.append(nn.ReLU())
                mlp_layers.append(nn.Dropout(p=dropout_rate))
                in_dim = hidden_dim
            self.mlp = nn.Sequential(*mlp_layers)

            # 4. Final Fusion Layer: Combines GMF element-wise product + MLP output
            final_in_dim = embedding_dim + mlp_hidden_dims[-1]
            self.predict_layer = nn.Sequential(
                nn.Linear(final_in_dim, 1),
                nn.Sigmoid()  # Normalizes output between 0 and 1 (rescaled to 1.0 - 5.0)
            )

            # Initialize weights
            self._init_weights()

        def _init_weights(self):
            nn.init.normal_(self.user_embed_gmf.weight, std=0.01)
            nn.init.normal_(self.item_embed_gmf.weight, std=0.01)
            nn.init.normal_(self.user_embed_mlp.weight, std=0.01)
            nn.init.normal_(self.item_embed_mlp.weight, std=0.01)
            for m in self.mlp:
                if isinstance(m, nn.Linear):
                    nn.init.kaiming_uniform_(m.weight)

        def forward(self, user_indices, item_indices):
            # GMF Branch: element-wise interaction
            gmf_u = self.user_embed_gmf(user_indices)
            gmf_i = self.item_embed_gmf(item_indices)
            gmf_out = gmf_u * gmf_i

            # MLP Branch: deep non-linear interaction
            mlp_u = self.user_embed_mlp(user_indices)
            mlp_i = self.item_embed_mlp(item_indices)
            mlp_in = torch.cat([mlp_u, mlp_i], dim=-1)
            mlp_out = self.mlp(mlp_in)

            # Fusion
            fusion = torch.cat([gmf_out, mlp_out], dim=-1)
            out = self.predict_layer(fusion).squeeze(-1)
            # Scale sigmoid [0, 1] to star rating scale [1.0, 5.0]
            return (out * 4.0) + 1.0
else:
    class NeuralMatrixFactorization:
        def __init__(self, *args, **kwargs):
            raise ImportError("PyTorch is required for NeuralMatrixFactorization. Run: pip install torch")
