import time
from datetime import datetime
import uuid
import logging
import numpy as np

from .database import (
    create_attendance_record,
    update_attendance_record,
    close_attendance_record,
    save_unknown_identity
)

class LifecycleEngine:
    def __init__(self, exit_threshold_seconds=10.0, unknown_expiry_minutes=180.0):
        self.exit_threshold_seconds = exit_threshold_seconds
        self.unknown_expiry_minutes = unknown_expiry_minutes

        # track_id → lifecycle info
        self.active_registry = {}

        # unknown clustering cache
        self.unknown_registry = {}

    def process_tracker_results(self, camera_id, tracked_faces):
        now = time.time()

        # -------- HANDLE EXITS --------
        to_remove = []

        for track_id, data in self.active_registry.items():
            if now - data["last_seen"] > self.exit_threshold_seconds:
                close_attendance_record(data["record_id"])
                logging.info(f"EXIT registered for {data['identity']}")
                to_remove.append(track_id)

        for tid in to_remove:
            del self.active_registry[tid]

        # -------- HANDLE TRACK INPUT --------
        for face in tracked_faces:
            local_track_id = face["track_id"]
            global_track_id = f"{camera_id}_{local_track_id}"
            
            identity = face["identity"]
            confidence = face["confidence"]
            embedding = face.get("embedding")
            is_unknown = face.get("is_unknown", False)

            # Normalize embedding type
            if embedding is not None and hasattr(embedding, "tolist"):
                embedding = embedding.tolist()

            # Handle unknown clustering
            if is_unknown and embedding is not None:
                identity = self._handle_unknown(embedding, confidence)

            # -------- UPDATE EXISTING TRACK --------
            if global_track_id in self.active_registry:
                self.active_registry[global_track_id]["last_seen"] = now
                record_id = self.active_registry[global_track_id]["record_id"]

                update_attendance_record(record_id, confidence)

                # identity upgrade (unknown → known)
                if not is_unknown and self.active_registry[global_track_id]["is_unknown"]:
                    self.active_registry[global_track_id]["identity"] = identity
                    self.active_registry[global_track_id]["is_unknown"] = False

            # -------- NEW ENTRY OR MERGE --------
            else:
                # Check if this identity is already active
                existing_global_id = None
                for gid, data in self.active_registry.items():
                    if data["identity"] == identity:
                        existing_global_id = gid
                        break

                if existing_global_id:
                    # Merge with existing active record
                    record_id = self.active_registry[existing_global_id]["record_id"]
                    
                    update_attendance_record(record_id, confidence)

                    self.active_registry[global_track_id] = {
                        "identity": identity,
                        "record_id": record_id,
                        "last_seen": now,
                        "is_unknown": is_unknown
                    }
                    
                    # Remove the old stalled track to prevent duplicate headcounts
                    del self.active_registry[existing_global_id]
                    
                    logging.info(f"MERGED new track for active identity {identity}")
                else:
                    record_id = create_attendance_record(
                        identity,
                        camera_id,
                        is_unknown,
                        confidence
                    )

                    self.active_registry[global_track_id] = {
                        "identity": identity,
                        "record_id": record_id,
                        "last_seen": now,
                        "is_unknown": is_unknown
                    }

                    logging.info(f"ENTRY registered for {identity}")

    def _cosine_similarity(self, v1, v2):
        v1 = np.array(v1)
        v2 = np.array(v2)
        return float(np.dot(v1, v2))

    def _handle_unknown(self, embedding, confidence):
        now = time.time()

        # remove expired unknown clusters
        expired = []
        for uid, data in self.unknown_registry.items():
            if (now - data["last_seen"]) / 60 > self.unknown_expiry_minutes:
                expired.append(uid)

        for uid in expired:
            del self.unknown_registry[uid]

        best_match = None
        best_sim = -1

        for uid, data in self.unknown_registry.items():
            sim = self._cosine_similarity(embedding, data["embedding"])
            if sim > best_sim:
                best_sim = sim
                best_match = uid

        # reuse existing unknown if similar
        if best_sim > 0.4:
            self.unknown_registry[best_match]["last_seen"] = now
            return best_match

        # create new unknown
        new_id = f"unknown_{uuid.uuid4().hex[:8]}"

        self.unknown_registry[new_id] = {
            "embedding": embedding,
            "first_seen": datetime.utcnow(),
            "last_seen": now
        }

        save_unknown_identity(
            new_id,
            embedding,
            self.unknown_registry[new_id]["first_seen"],
            confidence
        )

        return new_id
