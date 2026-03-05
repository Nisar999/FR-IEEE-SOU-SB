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
    # Active meaning exit_time is None
    active_records = list(attendance_col.find({"status": "active"}))
    known = 0
    unknown = 0
    
    for r in active_records:
        if r.get("is_unknown", False):
            unknown += 1
        else:
            known += 1
            
    return {
        "known_persons": known,
        "unknown_persons": unknown,
        "total_persons": known + unknown
    }

@api_router.get("/active-persons")
def get_active_persons():
    # Return basic details of currently active persons
    active = list(attendance_col.find({"status": "active"}, {"_id": 0}))
    return active

@api_router.get("/today-attendance")
def get_today_attendance():
    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day)
    
    records = list(attendance_col.find({
        "entry_time": {"$gte": start_of_day}
    }, {"_id": 0}).sort("entry_time", -1))
    
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
    unknown_record = unknown_col.find_one({"unknown_id": req.unknown_id, "promoted": False})
    if not unknown_record:
        raise HTTPException(status_code=404, detail="Unknown identity not found or already promoted.")
        
    # Promote Logic
    # 1. Save to persons
    try:
        persons_col.insert_one({
            "name": req.known_name,
            "embedding": unknown_record["embedding"],
            "created_at": datetime.utcnow()
        })
    except Exception as e:
        # Duplicate name
        pass # Handle merge if needed

    # 2. Update unknown archive
    unknown_col.update_one(
        {"unknown_id": req.unknown_id},
        {"$set": {"promoted": True, "promoted_to": req.known_name}}
    )
    
    # 3. Update attendance logs historical
    attendance_col.update_many(
        {"person_name": req.unknown_id},
        {"$set": {"person_name": req.known_name, "is_unknown": False}}
    )

    # 4. Trigger engine re-load of embeddings
    # Note: Requires IPC or shared state, simplest is to just call engine.load_embeddings()
    # since these run in same process in this simple setup.
    camera_manager.recognition_engine.load_embeddings()

    return {"status": "success", "message": f"{req.unknown_id} promoted to {req.known_name}"}

@api_router.get("/camera-status")
def get_camera_status():
    return list(camera_status_col.find({}, {"_id": 0}))
