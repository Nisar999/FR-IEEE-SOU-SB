from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from .database import (
    attendance_col,
    camera_status_col,
    unknown_col,
    persons_col,
    get_all_unknowns,
    get_person_history
)

from .camera_manager import CameraManager

api_router = APIRouter()

camera_manager = CameraManager()

@api_router.get("/health")
def read_health():
    return {"status": "ok", "timestamp": datetime.utcnow()}

@api_router.get("/live-headcount")
def get_live_headcount():
    # Use real-time lifecycle registry instead of database
    registry = camera_manager.lifecycle_engine.active_registry

    unique_knowns = set()
    unique_unknowns = set()

    for data in registry.values():
        if data.get("is_unknown", False):
            unique_unknowns.add(data["identity"])
        else:
            unique_knowns.add(data["identity"])

    return {
        "known_persons": len(unique_knowns),
        "unknown_persons": len(unique_unknowns),
        "total_persons": len(unique_knowns) + len(unique_unknowns)
    }

@api_router.get("/active-persons")
def get_active_persons():
    registry = camera_manager.lifecycle_engine.active_registry

    persons = []

    for track_id, data in registry.items():
        persons.append({
            "track_id": track_id,
            "identity": data["identity"],
            "is_unknown": data["is_unknown"],
            "last_seen": data["last_seen"]
        })

    return persons

@api_router.get("/today-attendance")
def get_today_attendance():
    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day)

    records = list(
        attendance_col.find(
            {"entry_time": {"$gte": start_of_day}},
            {"_id": 0}
        ).sort("entry_time", -1)
    )

    return records

@api_router.get("/person-history/{name}")
def person_history(name: str):
    return get_person_history(name)

@api_router.get("/unknown-persons")
def get_unknown_persons():
    return get_all_unknowns()

class PromoteRequest(BaseModel):
    unknown_id: str
    known_name: str

@api_router.post("/promote-unknown")
def promote_unknown(req: PromoteRequest):
    unknown_record = unknown_col.find_one({
        "unknown_id": req.unknown_id,
        "promoted": False
    })

    if not unknown_record:
        raise HTTPException(
            status_code=404,
            detail="Unknown identity not found or already promoted."
        )

    try:
        persons_col.insert_one({
            "name": req.known_name,
            "embedding": unknown_record["embedding"],
            "created_at": datetime.utcnow()
        })
    except Exception:
        pass

    unknown_col.update_one(
        {"unknown_id": req.unknown_id},
        {"$set": {
            "promoted": True,
            "promoted_to": req.known_name
        }}
    )

    attendance_col.update_many(
        {"person_name": req.unknown_id},
        {"$set": {
            "person_name": req.known_name,
            "is_unknown": False
        }}
    )

    # Reload embeddings after promotion
    camera_manager.recognition_engine.load_embeddings()

    return {
        "status": "success",
        "message": f"{req.unknown_id} promoted to {req.known_name}"
    }

@api_router.get("/camera-status")
def get_camera_status():
    return list(camera_status_col.find({}, {"_id": 0}))
