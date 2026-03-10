import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from datetime import datetime
import logging
import uuid
import time

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "face_recognition"

# Add serverSelectionTimeoutMS for faster failure detection and retries
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

# Collections
persons_col = db["persons"]
attendance_col = db["attendance_logs"]
unknown_col = db["unknown_archive"]
camera_status_col = db["camera_status"]

def _retry_mongo(func, retries=3, delay=1):
    def wrapper(*args, **kwargs):
        for i in range(retries):
            try:
                return func(*args, **kwargs)
            except (ConnectionFailure, OperationFailure) as e:
                logging.warning(f"MongoDB operation failed, retrying {i+1}/{retries}: {e}")
                time.sleep(delay)
        logging.error("MongoDB operation failed after max retries")
        return None
    return wrapper

def init_db():
    try:
        persons_col.create_index("name", unique=True)
        attendance_col.create_index([("person_name", 1), ("status", 1)])
        unknown_col.create_index("unknown_id", unique=True)
        logging.info("Database initialized with indexes.")
    except Exception as e:
        logging.error(f"MongoDB indexing failed: {e}")

@_retry_mongo
def create_attendance_record(name: str, camera_id: str, is_unknown: bool, confidence: float):
    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day)
    
    # Check if a record for this person already exists today
    existing = attendance_col.find_one({
        "person_name": name,
        "entry_time": {"$gte": start_of_day}
    })
    
    if existing:
        attendance_col.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "last_seen": now,
                    "status": "active",
                    "camera_id": camera_id # update to latest camera seen on
                },
                "$inc": {
                    "visit_count": 1,
                    "confidence_sum": confidence,
                    "readings_count": 1
                }
            }
        )
        return existing["_id"]

    # If no existing record today, create a new one
    record = {
        "person_name": name,
        "camera_id": camera_id,
        "entry_time": now,
        "last_seen": now,
        "exit_time": None,
        "duration_seconds": 0,
        "visit_count": 1, 
        "avg_confidence": confidence,
        "confidence_sum": confidence,
        "readings_count": 1,
        "is_unknown": is_unknown,
        "status": "active"
    }
    
    res = attendance_col.insert_one(record)
    return res.inserted_id

@_retry_mongo
def update_attendance_record(record_id, new_confidence: float):
    now = datetime.utcnow()
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

@_retry_mongo
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

@_retry_mongo
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
    
@_retry_mongo
def save_unknown_identity(identity, embedding, first_seen, confidence):
    if identity is None or identity == "":
        identity = f"unknown_{uuid.uuid4().hex[:8]}"

    if hasattr(embedding, "tolist"):
        embedding = embedding.tolist()

    doc = {
        "unknown_id": identity,
        "embedding": embedding,
        "first_seen": first_seen,
        "confidence": float(confidence)
    }

    unknown_col.update_one(
        {"unknown_id": identity},
        {"$setOnInsert": doc},
        upsert=True
    )

@_retry_mongo
def get_all_unknowns():
    docs = unknown_col.find({"promoted": {"$ne": True}}, {"_id": 0})
    return list(docs) if docs else []

@_retry_mongo
def get_person_history(name: str):
    docs = attendance_col.find({"person_name": name}, {"_id": 0}).sort("entry_time", -1)
    return list(docs) if docs else []
