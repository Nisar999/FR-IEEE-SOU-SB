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
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CameraManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self,
                 config_path=r"./config/cameras.yaml",
                 target_resolution=(640, 360),
                 fps_sampling=1):
        if self._initialized:
            return
        self._initialized = True

        self.config_path = config_path
        self.target_resolution = target_resolution
        self.fps_sampling = fps_sampling

        self.threads = []
        self.stop_event = threading.Event()

        # Engines
        self.recognition_engine = RecognitionEngine()
        self.lifecycle_engine = LifecycleEngine()

        # One tracker per camera
        self.trackers = {}
        
        # Store latest encoded frame per camera
        self.latest_frames = {}
        self.processed_frames = {}
        self.frame_lock = threading.Lock()

    def load_config(self):
        try:
            with open(self.config_path, "r") as f:
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

            t_cam = threading.Thread(
                target=self._camera_worker,
                args=(cam_id, rtsp_url),
                daemon=True
            )
            
            t_proc = threading.Thread(
                target=self._processing_worker,
                args=(cam_id,),
                daemon=True
            )

            self.threads.append(t_cam)
            self.threads.append(t_proc)
            
            t_cam.start()
            t_proc.start()

            logging.info(f"Started workers for camera {cam_id}")

    def stop_all(self):
        self.stop_event.set()

        for t in self.threads:
            t.join()

        logging.info("All camera workers stopped.")

    def _camera_worker(self, camera_id, rtsp_url):
        update_camera_status(camera_id, "connecting")

        cap = cv2.VideoCapture(rtsp_url)
        # Reduce buffer size to ensure we get the latest frame
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not cap.isOpened():
            update_camera_status(camera_id, "error", f"Failed to open {rtsp_url}")
            return

        update_camera_status(camera_id, "active")

        while not self.stop_event.is_set():
            ret, frame = cap.read()

            if not ret:
                update_camera_status(camera_id, "error", "Stream disconnected. Reconnecting...")
                cap.release()
                time.sleep(5)
                cap = cv2.VideoCapture(rtsp_url)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                if cap.isOpened():
                    update_camera_status(camera_id, "active")
                continue

            frame_resized = cv2.resize(frame, self.target_resolution)

            # Store raw BGR frame for both stream and processing
            with self.frame_lock:
                self.latest_frames[camera_id] = frame_resized

            # We don't sleep here much to keep clearing the buffer and get low-latency

        cap.release()
        update_camera_status(camera_id, "offline")

    def _processing_worker(self, camera_id):
        last_process_time = time.time()
        
        while not self.stop_event.is_set():
            current_time = time.time()
            
            if current_time - last_process_time >= (1.0 / self.fps_sampling):
                last_process_time = current_time

                with self.frame_lock:
                    if camera_id not in self.latest_frames or self.latest_frames[camera_id] is None:
                        continue
                    frame_to_process = self.latest_frames[camera_id].copy()
                
                # GPU / CPU Face detection + recognition
                try:
                    recognition_results = self.recognition_engine.process_frame(frame_to_process)

                    detections = []
                    for res in recognition_results:
                        if res.get("confidence", 1.0) < 0.40:
                            continue
                        detections.append({
                            "bbox": res["bbox"],
                            "identity": res["name"],
                            "confidence": res["confidence"],
                            "embedding": res["embedding"],
                            "is_unknown": res["is_unknown"]
                        })

                    # Tracking
                    tracked_faces = self.trackers[camera_id].update(detections)

                    # Lifecycle management
                    self.lifecycle_engine.process_tracker_results(camera_id, tracked_faces)

                    # Update the active boxes overlay drawing (Optional, done by frontend via active_registry usually, 
                    # but if we want baked-in bounding boxes on the server stream, we draw it over self.latest_frames directly).
                    # For WebRTC, frontend overlay is preferred but we'll bake it for simplicity of fallback.
                    with self.frame_lock:
                        if camera_id in self.latest_frames:
                            display_frame = self.latest_frames[camera_id].copy()
                            for face_data in tracked_faces:
                                bbox = face_data['bbox']
                                x1, y1, x2, y2 = map(int, bbox)
                                identity = face_data.get('identity', 'Unknown')
                                confidence = face_data.get('confidence', 0)
                                color = (0, 0, 255) if face_data.get('is_unknown', True) else (0, 255, 0)
                                cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
                                label = f"{identity} ({confidence:.2f})"
                                cv2.putText(display_frame, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
                            self.processed_frames[camera_id] = display_frame
                except Exception as e:
                    logging.error(f"Error in processing worker for {camera_id}: {e}")
            
            time.sleep(0.01) # Small sleep to yield CPU
