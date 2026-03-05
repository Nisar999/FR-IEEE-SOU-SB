import os
import pickle
import numpy as np
import logging
from insightface.app import FaceAnalysis

class RecognitionEngine:
    def __init__(self,
                 embeddings_path=r"./embeddings/embeddings_averaged.pkl",
                 similarity_threshold=0.5):
        self.embeddings_path = embeddings_path
        self.similarity_threshold = similarity_threshold
        self.known_embeddings = {}

        self.load_embeddings()

        # Initialize InsightFace (CPU)
        self.app = FaceAnalysis(
            name="buffalo_l",
            providers=['CPUExecutionProvider']
        )

        self.app.prepare(ctx_id=0, det_size=(320, 320))

        logging.info("InsightFace FaceAnalysis initialized (CPU).")

    def load_embeddings(self):
        if not os.path.exists(self.embeddings_path):
            logging.warning(
                f"Embeddings file not found at {self.embeddings_path}"
            )
            self.known_embeddings = {}
            return

        with open(self.embeddings_path, "rb") as f:
            data = pickle.load(f)

        logging.info("Loading embeddings...")

        # CASE 1 — standard embeddings format
        if isinstance(data, dict) and "embeddings" in data and "names" in data:
            embeddings = data["embeddings"]
            names = data["names"]

            for name, emb in zip(names, embeddings):
                emb = np.array(emb, dtype=np.float32)

                if name not in self.known_embeddings:
                    self.known_embeddings[name] = []

                self.known_embeddings[name].append(emb)

        # CASE 2 — averaged embeddings format
        elif isinstance(data, dict):
            for name, emb in data.items():
                emb = np.array(emb, dtype=np.float32)

                if emb.ndim == 1:
                    emb = emb.reshape(1, -1)

                self.known_embeddings[name] = emb
        else:
            raise ValueError("Unknown embeddings file structure")

        logging.info(
            f"Loaded embeddings for {len(self.known_embeddings)} identities."
        )

    def process_frame(self, frame_bgr):
        faces = self.app.get(frame_bgr)
        results = []

        for face in faces:
            bbox = face.bbox.astype(int).tolist()
            embedding = face.normed_embedding.astype(np.float32)

            best_match = None
            highest_sim = -1.0

            for name, known_emb in self.known_embeddings.items():
                sims = np.dot(known_emb, embedding)
                sim = float(np.max(sims))

                if sim > highest_sim:
                    highest_sim = sim
                    best_match = name

            identity = "Unknown"
            is_unknown = True

            if highest_sim >= self.similarity_threshold:
                identity = best_match
                is_unknown = False

            results.append({
                "name": identity,
                "confidence": float(highest_sim),
                "embedding": embedding.tolist(),
                "bbox": bbox,
                "is_unknown": is_unknown
            })

        return results
