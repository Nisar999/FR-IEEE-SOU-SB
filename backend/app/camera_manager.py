import yaml
import threading
import time
import cv2
import logging

from .database import update_camera_status, cameras_col
from .settings import app_settings
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

    def __init__(self, target_resolution=(640, 360)):
        if self._initialized:
            return
        self._initialized = True

        self.target_resolution = target_resolution
        
        # Threads mapped by camera_id
        self.camera_threads = {}
        
        # Engines
        self.recognition_engine = RecognitionEngine()
        self.lifecycle_engine = LifecycleEngine()

        # One tracker per camera
        self.trackers = {}
        
        # Store latest encoded frame per camera
        self.latest_frames = {}
        self.processed_frames = {}
        self.frame_lock = threading.Lock()

    def start_all(self):
        docs = list(cameras_col.find({}))
        if not docs:
            logging.warning("No cameras configured in database.")
            return

        for cam in docs:
            self.add_camera(cam["camera_id"], cam["camera_source"])

    def add_camera(self, cam_id, source):
        if cam_id in self.camera_threads:
            return
            
        self.trackers[cam_id] = FaceTracker()
        
        stop_evt = threading.Event()

        t_cam = threading.Thread(
            target=self._camera_worker,
            args=(cam_id, source, stop_evt),
            daemon=True
        )
        
        t_proc = threading.Thread(
            target=self._processing_worker,
            args=(cam_id, stop_evt),
            daemon=True
        )
        
        self.camera_threads[cam_id] = {
            "cam_thread": t_cam,
            "proc_thread": t_proc,
            "stop_evt": stop_evt
        }

        t_cam.start()
        t_proc.start()
        logging.info(f"Started workers for camera {cam_id}")

    def remove_camera(self, cam_id):
        if cam_id not in self.camera_threads:
            return
            
        meta = self.camera_threads[cam_id]
        meta["stop_evt"].set()
        
        # wait gracefully
        # meta["cam_thread"].join(timeout=1)
        # meta["proc_thread"].join(timeout=1)
        
        del self.camera_threads[cam_id]
        if cam_id in self.trackers:
            del self.trackers[cam_id]
        if cam_id in self.latest_frames:
            del self.latest_frames[cam_id]
        if cam_id in self.processed_frames:
            del self.processed_frames[cam_id]
            
        logging.info(f"Stopped and removed workers for camera {cam_id}")

    def stop_all(self):
        for cam_id in list(self.camera_threads.keys()):
            self.remove_camera(cam_id)
        logging.info("All camera workers stopped.")

    def _camera_worker(self, camera_id, source, stop_evt):
        update_camera_status(camera_id, "connecting")

        cv2_source = int(source) if str(source).isdigit() else source
        cap = cv2.VideoCapture(cv2_source)
        # Reduce buffer size to ensure we get the latest frame
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

        if not cap.isOpened():
            update_camera_status(camera_id, "error", f"Failed to open {rtsp_url}")
            return

        update_camera_status(camera_id, "active")

        while not stop_evt.is_set():
            ret, frame = cap.read()

            if not ret:
                update_camera_status(camera_id, "error", "Stream disconnected. Reconnecting...")
                cap.release()
                stop_evt.wait(5)
                if stop_evt.is_set(): break
                cap = cv2.VideoCapture(cv2_source)
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

    def _processing_worker(self, camera_id, stop_evt):
        last_process_time = time.time()
        
        while not stop_evt.is_set():
            current_time = time.time()
            
            if current_time - last_process_time >= (1.0 / max(0.1, app_settings.fps_sampling)):
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
                                color = (0, 255, 255) if face_data.get('is_unknown', True) else (0, 255, 0)
                                cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
                                label = f"{identity} ({confidence:.2f})"
                                cv2.putText(display_frame, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
                            self.processed_frames[camera_id] = display_frame
                except Exception as e:
                    logging.error(f"Error in processing worker for {camera_id}: {e}")
            
            time.sleep(0.01) # Small sleep to yield CPU
