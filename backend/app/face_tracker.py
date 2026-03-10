import time
import math
import numpy as np
from scipy.optimize import linear_sum_assignment

class FaceTracker:
    def __init__(self, track_distance_threshold=120.0, track_expiry_seconds=5.0, embedding_threshold=0.60):
        # Increased distance threshold to accommodate fast movement
        self.track_distance_threshold = track_distance_threshold
        # Decreased expiry heavily to prevent zombie tracks lingering after target moves quickly
        self.track_expiry_seconds = track_expiry_seconds
        self.embedding_threshold = embedding_threshold

        # track_id → track data
        self.tracks = {}

        self.next_track_id = 0

    def _get_center(self, bbox):
        x_center = (bbox[0] + bbox[2]) / 2.0
        y_center = (bbox[1] + bbox[3]) / 2.0
        return (x_center, y_center)

    def _distance(self, p1, p2):
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    def _cosine_similarity(self, v1, v2):
        v1 = np.array(v1)
        v2 = np.array(v2)
        return float(np.dot(v1, v2))

    def update(self, detections):
        now = time.time()

        # -------- Remove expired tracks --------
        expired_tracks = [
            tid for tid, t in self.tracks.items()
            if now - t["last_seen"] > self.track_expiry_seconds
        ]

        for tid in expired_tracks:
            del self.tracks[tid]

        results = []
        if len(detections) == 0:
            for tid, track in self.tracks.items():
                results.append({
                    "track_id": tid,
                    "bbox": track["bbox"],
                    "identity": track["identity"],
                    "confidence": track["confidence"],
                    "embedding": track.get("embedding"),
                    "is_unknown": track["is_unknown"]
                })
            return results

        centers = [self._get_center(det["bbox"]) for det in detections]
        track_ids = list(self.tracks.keys())

        # If no existing tracks, create all as new
        if len(track_ids) == 0:
            for i, det in enumerate(detections):
                tid = self.next_track_id
                self.next_track_id += 1
                self.tracks[tid] = {
                    "bbox": det["bbox"],
                    "center": centers[i],
                    "last_seen": now,
                    "identity": det["identity"],
                    "confidence": det["confidence"],
                    "embedding": det["embedding"],
                    "is_unknown": det["is_unknown"]
                }
                results.append({
                    "track_id": tid,
                    "bbox": det["bbox"],
                    "identity": det["identity"],
                    "confidence": det["confidence"],
                    "embedding": det["embedding"],
                    "is_unknown": det["is_unknown"]
                })
            return results

        # -------- Match existing tracks (Hungarian Algorithm) --------
        
        # Cost matrix: rows=tracks, cols=detections
        cost_matrix = np.full((len(track_ids), len(detections)), 1e6)

        for r, tid in enumerate(track_ids):
            track = self.tracks[tid]
            for c, det in enumerate(detections):
                dist = self._distance(track["center"], centers[c])
                
                embedding_sim = 0
                if track.get("embedding") is not None and det.get("embedding") is not None:
                    embedding_sim = self._cosine_similarity(track["embedding"], det["embedding"])

                # Spatial takes priority if close
                if dist < self.track_distance_threshold:
                    cost_matrix[r, c] = dist
                elif embedding_sim > self.embedding_threshold:
                    cost_matrix[r, c] = 500.0 - (embedding_sim * 100) # Arbitrary safe cost lower than 1e6

        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        matched_dets = set()

        for r, c in zip(row_ind, col_ind):
            # If cost is unassigned (1e6), it's a mismatch
            if cost_matrix[r, c] >= 1e5:
                continue

            tid = track_ids[r]
            det = detections[c]
            track = self.tracks[tid]

            # Identity upgrade (Unknown → Known)
            if track["is_unknown"] and not det["is_unknown"]:
                track["identity"] = det["identity"]
                track["is_unknown"] = False
                track["confidence"] = det["confidence"]
            elif not track["is_unknown"] and not det["is_unknown"]:
                if det["confidence"] > track.get("confidence", 0) + 0.05:
                    track["identity"] = det["identity"]
                    track["confidence"] = det["confidence"]
            
            if track["identity"] == det["identity"] and det["confidence"] > track.get("confidence", 0):
                track["confidence"] = det["confidence"]

            track["bbox"] = det["bbox"]
            track["center"] = centers[c]
            track["last_seen"] = now

            if det.get("embedding") is not None:
                track["embedding"] = det["embedding"]

            matched_dets.add(c)
            
            results.append({
                "track_id": tid,
                "bbox": det["bbox"],
                "identity": track["identity"],
                "confidence": track["confidence"],
                "embedding": track["embedding"],
                "is_unknown": track["is_unknown"]
            })

        # -------- Create new tracks for unmatched detections --------
        unmatched_dets = [i for i in range(len(detections)) if i not in matched_dets]

        for idx in unmatched_dets:
            det = detections[idx]

            tid = self.next_track_id
            self.next_track_id += 1

            self.tracks[tid] = {
                "bbox": det["bbox"],
                "center": centers[idx],
                "last_seen": now,
                "identity": det["identity"],
                "confidence": det["confidence"],
                "embedding": det["embedding"],
                "is_unknown": det["is_unknown"]
            }

            results.append({
                "track_id": tid,
                "bbox": det["bbox"],
                "identity": det["identity"],
                "confidence": det["confidence"],
                "embedding": det["embedding"],
                "is_unknown": det["is_unknown"]
            })

        # Inject existing matched tracks into results that weren't visible this frame 
        # but are still unexpired
        active_tids = [r["track_id"] for r in results]
        for tid, track in self.tracks.items():
            if tid not in active_tids:
                results.append({
                    "track_id": tid,
                    "bbox": track["bbox"],
                    "identity": track["identity"],
                    "confidence": track["confidence"],
                    "embedding": track.get("embedding"),
                    "is_unknown": track["is_unknown"]
                })

        return results

