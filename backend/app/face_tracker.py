import time
import math
import logging

class FaceTracker:
    def __init__(self, track_distance_threshold=80.0, track_expiry_seconds=3.0):
        self.track_distance_threshold = track_distance_threshold
        self.track_expiry_seconds = track_expiry_seconds
        
        # Structure: { track_id: {"center": (x,y), "last_seen": timestamp, "identity": str, "avg_confidence": float, "is_unknown": bool} }
        self.tracks = {}
        self.next_track_id = 0

    def _get_center(self, bbox):
        # bbox is [x1, y1, x2, y2]
        x_center = (bbox[0] + bbox[2]) / 2.0
        y_center = (bbox[1] + bbox[3]) / 2.0
        return (x_center, y_center)

    def _distance(self, p1, p2):
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    def update(self, bboxes, identities, confidences, is_unknowns):
        """
        Updates the tracker with new detections.
        Expects lists of same length for bboxes, identities, confidences, and is_unknowns of current frame.
        Returns a list of updated identities based on tracking logic.
        """
        now = time.time()
        
        # Expire old tracks
        expired = [tid for tid, data in self.tracks.items() if now - data["last_seen"] > self.track_expiry_seconds]
        for tid in expired:
            del self.tracks[tid]
            
        current_centers = [self._get_center(bbox) for bbox in bboxes]
        
        matched_results = []
        
        # Very simple greedy matching for demonstration
        # A more robust approach would use Hungarian algorithm (scipy.optimize.linear_sum_assignment)
        
        unmatched_detections = list(range(len(bboxes)))
        
        for tid, track_data in self.tracks.items():
            best_dist = float('inf')
            best_det_idx = -1
            
            for idx in unmatched_detections:
                dist = self._distance(track_data["center"], current_centers[idx])
                if dist < best_dist and dist < self.track_distance_threshold:
                    best_dist = dist
                    best_det_idx = idx
            
            if best_det_idx != -1:
                # Match found! Update track.
                # If we tracked it but recognition didn't confidently recognize, use tracked identity
                # If recognition provides a very strong match, we might want to update track identity.
                # For this simple logic: keep original tracked identity unless it was unknown and now it's known.
                
                det_identity = identities[best_det_idx]
                det_unknown = is_unknowns[best_det_idx]
                
                # If track was unknown, and detection is known, update track to known!
                if track_data["is_unknown"] and not det_unknown:
                     track_data["identity"] = det_identity
                     track_data["is_unknown"] = False
                     
                track_data["center"] = current_centers[best_det_idx]
                track_data["last_seen"] = now
                
                matched_results.append({
                    "track_id": tid,
                    "bbox": bboxes[best_det_idx],
                    "identity": track_data["identity"],
                    "confidence": confidences[best_det_idx],
                    "is_unknown": track_data["is_unknown"]
                })
                
                unmatched_detections.remove(best_det_idx)
                
        # Register new detections as new tracks
        for idx in unmatched_detections:
            tid = self.next_track_id
            self.next_track_id += 1
            
            self.tracks[tid] = {
                "center": current_centers[idx],
                "last_seen": now,
                "identity": identities[idx],
                "avg_confidence": confidences[idx],
                "is_unknown": is_unknowns[idx]
            }
            
            matched_results.append({
                "track_id": tid,
                "bbox": bboxes[idx],
                "identity": identities[idx],
                "confidence": confidences[idx],
                "is_unknown": is_unknowns[idx]
            })
            
        return matched_results
