import yaml
import threading
import time
import cv2
import logging
from .database import update_camera_status
from .recognition_engine import RecognitionEngine
from .face_tracker import FaceTracker
from .lifecycle_engine import LifecycleEngine

class CameraManager:
    def __init__(self, config_path=r"./config/cameras.yaml", target_resolution=(640, 360), fps_sampling=1):
        self.config_path = config_path
        self.target_resolution = target_resolution
        self.fps_sampling = fps_sampling
        
        self.threads = []
        self.stop_event = threading.Event()
        
        # Shared engines for now. In a heavy production env, 
        # RecognitionEngine might be instantiated per camera or put behind a ThreadPoolExecutor 
        # to ensure the CPU isn't bottlenecked by GIL, but since FaceAnalysis uses onnxruntime C++, 
        # it frequently releases the GIL.
        self.recognition_engine = RecognitionEngine()
        
        # One Lifecycle Engine for all cameras to track global Entry/Exit
        self.lifecycle_engine = LifecycleEngine()
        
        # One tracker per camera to correlate local bounding boxes
        self.trackers = {}

    def load_config(self):
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logging.error(f"Failed to load camera config: {e}")
            return {}

    def start_all(self):
        cameras = self.load_config()
        if not cameras:
            logging.warning("No cameras configured.")
            return
            
        for cam_id, rtsp_url in cameras.items():
            self.trackers[cam_id] = FaceTracker()
            t = threading.Thread(target=self._camera_worker, args=(cam_id, rtsp_url), daemon=True)
            self.threads.append(t)
            t.start()
            logging.info(f"Started worker for camera {cam_id}")

    def stop_all(self):
        self.stop_event.set()
        for t in self.threads:
            t.join()
        logging.info("All camera workers stopped.")

    def _camera_worker(self, camera_id, rtsp_url):
        update_camera_status(camera_id, "connecting")
        cap = cv2.VideoCapture(rtsp_url)
        
        if not cap.isOpened():
            update_camera_status(camera_id, "error", f"Failed to open {rtsp_url}")
            return
            
        update_camera_status(camera_id, "active")
        
        # To enforce 1 processing frame per second regardless of source FPS
        last_process_time = time.time()
        
        while not self.stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                update_camera_status(camera_id, "error", "Stream disconnected. Reconnecting...")
                cap.release()
                time.sleep(5)
                cap = cv2.VideoCapture(rtsp_url)
                if cap.isOpened():
                    update_camera_status(camera_id, "active")
                continue
                
            current_time = time.time()
            if current_time - last_process_time >= (1.0 / self.fps_sampling):
                last_process_time = current_time
                
                # Resize
                frame_resized = cv2.resize(frame, self.target_resolution)
                
                # Recognize
                recognition_results = self.recognition_engine.process_frame(frame_resized)
                
                bboxes = [res["bbox"] for res in recognition_results]
                identities = [res["name"] for res in recognition_results]
                confidences = [res["confidence"] for res in recognition_results]
                is_unknowns = [res["is_unknown"] for res in recognition_results]
                
                # Inject embeddings back into tracker output so lifecycle engine can use them
                
                # Track
                tracked_faces = self.trackers[camera_id].update(bboxes, identities, confidences, is_unknowns)
                
                # Re-attach embeddings conceptually (or do tracking inside process_frame loop)
                # simpler approach: we just pass the embeddings to lifecycle engine if it's unknown
                for tf in tracked_faces:
                    if tf["is_unknown"]:
                        # Find matching embedding from recognition_results using bounding box or identity mapping
                        for res in recognition_results:
                            if res["is_unknown"] and res["bbox"] == tf["bbox"]:
                                tf["embedding"] = res["embedding"]
                                break
                
                # Lifecycle Management
                self.lifecycle_engine.process_tracker_results(camera_id, tracked_faces)
                
                # Update status slightly
                update_camera_status(camera_id, "active")
                
        cap.release()
        update_camera_status(camera_id, "offline")
