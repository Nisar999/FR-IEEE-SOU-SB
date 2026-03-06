import time
import math
import numpy as np

class FaceTracker:
    def __init__(self, track_distance_threshold=80.0, track_expiry_seconds=3.0, embedding_threshold=0.70):
        self.track_distance_threshold = track_distance_threshold
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
        """
        detections = [
            {
                "bbox": [x1,y1,x2,y2],
                "identity": str,
                "confidence": float,
                "embedding": list,
                "is_unknown": bool
            }
        ]
        """

        now = time.time()

        # -------- Remove expired tracks --------
        expired_tracks = [
            tid for tid, t in self.tracks.items()
            if now - t["last_seen"] > self.track_expiry_seconds
        ]

        for tid in expired_tracks:
            del self.tracks[tid]

        centers = [self._get_center(det["bbox"]) for det in detections]

        results = []

        # -------- Match existing tracks --------
        pairs = []
        for tid, track in self.tracks.items():
            for i, det in enumerate(detections):
                dist = self._distance(track["center"], centers[i])

                embedding_sim = 0
                if track.get("embedding") is not None and det.get("embedding") is not None:
                    embedding_sim = self._cosine_similarity(track["embedding"], det["embedding"])

                # Matching rule
                if (dist < self.track_distance_threshold) or (embedding_sim > self.embedding_threshold):
                    score = embedding_sim - (dist * 0.001)
                    pairs.append((score, tid, i))

        # Sort pairs by best score descending
        pairs.sort(key=lambda x: x[0], reverse=True)

        matched_tids = set()
        matched_dets = set()

        for score, tid, idx in pairs:
            if tid in matched_tids or idx in matched_dets:
                continue

            det = detections[idx]
            track = self.tracks[tid]

            # Identity upgrade (Unknown → Known)
            if track["is_unknown"] and not det["is_unknown"]:
                track["identity"] = det["identity"]
                track["is_unknown"] = False
                track["confidence"] = det["confidence"]
            elif not track["is_unknown"] and not det["is_unknown"]:
                # Upgrade identity if new confidence is significantly higher
                if det["confidence"] > track.get("confidence", 0) + 0.05:
                    track["identity"] = det["identity"]
                    track["confidence"] = det["confidence"]
            
            # Update confidence if same identity and higher confidence
            if track["identity"] == det["identity"] and det["confidence"] > track.get("confidence", 0):
                track["confidence"] = det["confidence"]

            track["center"] = centers[idx]
            track["last_seen"] = now

            # Always update to latest reliable embedding if available
            if det.get("embedding") is not None:
                track["embedding"] = det["embedding"]

            matched_tids.add(tid)
            matched_dets.add(idx)

            results.append({
                "track_id": tid,
                "bbox": det["bbox"],
                "identity": track["identity"],
                "confidence": det["confidence"],
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

        return results
