from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
import time

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
    unique_knowns = set()
    unique_unknowns = set()

    with camera_manager.lifecycle_engine.registry_lock:
        registry = camera_manager.lifecycle_engine.active_registry
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
    persons = []

    with camera_manager.lifecycle_engine.registry_lock:
        registry = camera_manager.lifecycle_engine.active_registry

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

import io
from fastapi.responses import StreamingResponse

@api_router.get("/debug-frame")
def get_debug_frame():
    with camera_manager.frame_lock:
        frame = camera_manager.processed_frames.get("cam_01")
        if frame is None:
            frame = camera_manager.latest_frames.get("cam_01")
            
    if frame is None:
        return {"error": "no frame available"}
        
    import cv2
    _, buffer = cv2.imencode('.jpg', frame)
    return StreamingResponse(io.BytesIO(buffer), media_type="image/jpeg")

import asyncio
import cv2
import numpy as np
from aiortc import VideoStreamTrack, RTCPeerConnection, RTCSessionDescription
from av import VideoFrame

pcs = set()

class CameraStreamTrack(VideoStreamTrack):
    kind = "video"

    def __init__(self, camera_id):
        super().__init__()
        self.camera_id = camera_id

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        # Grab latest frame
        with camera_manager.frame_lock:
            frame = camera_manager.processed_frames.get(self.camera_id)
            if frame is None:
                frame = camera_manager.latest_frames.get(self.camera_id)

        if frame is None:
            # Send a blank frame if camera not ready
            frame = np.zeros((360, 640, 3), dtype=np.uint8)

        # WebRTC strictly prefers RGB formats to prevent black rendering bugs in Chrome
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        video_frame = VideoFrame.from_ndarray(frame_rgb, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        
        return video_frame

class OfferRequest(BaseModel):
    sdp: str
    type: str
    camera_id: str

@api_router.post("/offer")
async def offer(params: OfferRequest):
    offer = RTCSessionDescription(sdp=params.sdp, type=params.type)

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState == "failed" or pc.connectionState == "closed":
            pcs.discard(pc)

    # Add the video track for the requested camera
    video_track = CameraStreamTrack(camera_id=params.camera_id)
    pc.addTrack(video_track)

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}

@api_router.on_event("shutdown")
async def on_shutdown():
    # close all peer connections
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
