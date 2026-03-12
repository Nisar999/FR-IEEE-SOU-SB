from app.database import settings_col
import threading

class SystemSettings:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SystemSettings, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        
        # Default settings
        self.fps_sampling = 10.0
        self.recognition_fps = 2.0
        self.similarity_threshold = 0.45
        self.unknown_threshold = 0.35
        self.tracker_distance_threshold = 120.0
        self.exit_threshold_seconds = 5.0
        self.stream_fps = 15.0
        
        self.sync_from_db()
        
    def sync_from_db(self):
        doc = settings_col.find_one({"_id": "global_settings"})
        if doc:
            self.fps_sampling = doc.get("fps_sampling", self.fps_sampling)
            self.recognition_fps = doc.get("recognition_fps", self.recognition_fps)
            self.similarity_threshold = doc.get("similarity_threshold", self.similarity_threshold)
            self.unknown_threshold = doc.get("unknown_threshold", self.unknown_threshold)
            self.tracker_distance_threshold = doc.get("tracker_distance_threshold", self.tracker_distance_threshold)
            self.exit_threshold_seconds = doc.get("exit_threshold_seconds", self.exit_threshold_seconds)
            self.stream_fps = doc.get("stream_fps", self.stream_fps)
        else:
            self.save_to_db()
            
    def save_to_db(self):
        settings_col.update_one(
            {"_id": "global_settings"},
            {"$set": {
                "fps_sampling": self.fps_sampling,
                "recognition_fps": self.recognition_fps,
                "similarity_threshold": self.similarity_threshold,
                "unknown_threshold": self.unknown_threshold,
                "tracker_distance_threshold": self.tracker_distance_threshold,
                "exit_threshold_seconds": self.exit_threshold_seconds,
                "stream_fps": self.stream_fps,
            }},
            upsert=True
        )

# Global singleton
app_settings = SystemSettings()
