import os
from pymongo import MongoClient
from datetime import datetime
import logging
import uuid

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "face_recognition"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# Collections
persons_col = db["persons"]
attendance_col = db["attendance_logs"]
unknown_col = db["unknown_archive"]
camera_status_col = db["camera_status"]

def init_db():
    # Setup indexes
    persons_col.create_index("name", unique=True)
    attendance_col.create_index([("person_name", 1), ("status", 1)])
    unknown_col.create_index("unknown_id", unique=True)
    
    logging.info("Database initialized with indexes.")

def create_attendance_record(name: str, camera_id: str, is_unknown: bool, confidence: float):
    now = datetime.utcnow()
    record = {
        "person_name": name,
        "camera_id": camera_id,
        "entry_time": now,
        "last_seen": now,
        "exit_time": None,
        "duration_seconds": 0,
        "visit_count": 1, # Increment logic handles elsewhere if needed
        "avg_confidence": confidence,
        "confidence_sum": confidence,
        "readings_count": 1,
        "is_unknown": is_unknown,
        "status": "active"
    }
    
    res = attendance_col.insert_one(record)
    return res.inserted_id

def update_attendance_record(record_id, new_confidence: float):
    now = datetime.utcnow()
    # Find to calculate moving average locally or use inc
    
    attendance_col.update_one(
        {"_id": record_id},
        {
            "$set": {"last_seen": now},
            "$inc": {
                "confidence_sum": new_confidence,
                "readings_count": 1
            }
        }
    )

def close_attendance_record(record_id):
    now = datetime.utcnow()
    
    record = attendance_col.find_one({"_id": record_id})
    if record:
        entry_time = record.get("entry_time", now)
        duration = (now - entry_time).total_seconds()
        
        avg_conf = record.get("confidence_sum", 0) / max(1, record.get("readings_count", 1))
        
        attendance_col.update_one(
            {"_id": record_id},
            {
                "$set": {
                    "exit_time": now,
                    "duration_seconds": duration,
                    "avg_confidence": avg_conf,
                    "status": "completed"
                }
            }
        )

def update_camera_status(camera_id: str, status: str, error_msg: str = ""):
    camera_status_col.update_one(
        {"camera_id": camera_id},
        {
            "$set": {
                "status": status,
                "last_updated": datetime.utcnow(),
                "error": error_msg
            }
        },
        upsert=True
    )
    

def save_unknown_identity(identity, embedding, first_seen, confidence):

    # Ensure unknown_id always exists
    if identity is None or identity == "":
        identity = f"unknown_{uuid.uuid4().hex[:8]}"

    # Convert numpy embedding → list for MongoDB
    if hasattr(embedding, "tolist"):
        embedding = embedding.tolist()

    doc = {
        "unknown_id": identity,
        "embedding": embedding,
        "first_seen": first_seen,
        "confidence": float(confidence)
    }

    # Avoid duplicate insert crash
    unknown_col.update_one(
        {"unknown_id": identity},
        {"$setOnInsert": doc},
        upsert=True
    )




def get_all_unknowns():
    return list(unknown_col.find({"promoted": False}, {"_id": 0}))

def get_person_history(name: str):
    return list(attendance_col.find({"person_name": name}, {"_id": 0}).sort("entry_time", -1))
