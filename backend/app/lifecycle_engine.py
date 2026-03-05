import time
from datetime import datetime
import uuid
from .database import (
    create_attendance_record,
    update_attendance_record,
    close_attendance_record,
    save_unknown_identity,
    get_all_unknowns
)
import logging

class LifecycleEngine:
    def __init__(self, exit_threshold_seconds=10.0, unknown_expiry_minutes=180.0):
        self.exit_threshold_seconds = exit_threshold_seconds
        self.unknown_expiry_minutes = unknown_expiry_minutes
        
        # Structure: { name/unknown_id: {"record_id": mongo_id, "last_seen": timestamp, "is_unknown": bool} }
        self.active_registry = {}
        
        # Cache for recently seen unknowns to prevent duplicate entries
        self.unknown_registry = {} 

    def process_tracker_results(self, camera_id, tracked_faces):
        now = time.time()
        
        # Maintain Active Registry (Exits)
        to_exit = []
        for identity, data in self.active_registry.items():
            if now - data["last_seen"] > self.exit_threshold_seconds:
                to_exit.append(identity)
                
        for identity in to_exit:
            record_id = self.active_registry[identity]["record_id"]
            close_attendance_record(record_id)
            del self.active_registry[identity]
            logging.info(f"EXIT registered for {identity} at camera {camera_id}.")

        # Handle Tracker Inputs (Entry / Update)
        for face in tracked_faces:
            # We use face tracker's smoothed identity if we updated face_tracker.py
            identity = face["identity"]
            confidence = face["confidence"]
            is_unknown = face.get("is_unknown", False)
            embedding = face.get("embedding", None)
            
            # If unknown, map to unknown_id
            if is_unknown and embedding is not None:
                identity = self._handle_unknown(embedding, confidence)
                
            if identity in self.active_registry:
                # UPDATE
                self.active_registry[identity]["last_seen"] = now
                record_id = self.active_registry[identity]["record_id"]
                update_attendance_record(record_id, confidence)
            else:
                # ENTRY / RE-ENTRY
                record_id = create_attendance_record(identity, camera_id, is_unknown, confidence)
                self.active_registry[identity] = {
                    "record_id": record_id,
                    "last_seen": now,
                    "is_unknown": is_unknown
                }
                logging.info(f"ENTRY registered for {identity} at camera {camera_id}.")

    def _cosine_similarity(self, v1, v2):
        import numpy as np
        return np.dot(v1, np.array(v2).T)

    def _handle_unknown(self, embedding, confidence):
        # 1. Compare against local tracking registry for known unknowns
        now = time.time()
        
        # Cleanup expired unknowns from cache
        expired = [uid for uid, data in self.unknown_registry.items() if (now - data["last_seen"]) / 60.0 > self.unknown_expiry_minutes]
        for uid in expired:
            del self.unknown_registry[uid]
            
        best_match_id = None
        best_sim = -1.0
        
        for uid, data in self.unknown_registry.items():
            sim = self._cosine_similarity(embedding, data["embedding"])
            if sim > best_sim:
                best_sim = sim
                best_match_id = uid
                
        # Unknown threshold
        if best_sim > 0.4:
            self.unknown_registry[best_match_id]["last_seen"] = now
            return best_match_id
        else:
            # New unknown
            new_id = f"unknown_{uuid.uuid4().hex[:8]}"
            self.unknown_registry[new_id] = {
                "embedding": embedding,
                "first_seen": datetime.utcnow(),
                "last_seen": now,
                "avg_confidence": confidence
            }
            # Save to unknown_archive
            save_unknown_identity(new_id, embedding, self.unknown_registry[new_id]["first_seen"], confidence)
            return new_id
