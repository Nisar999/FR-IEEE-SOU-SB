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
    cameras_col,
    get_all_unknowns,
    get_person_history
)

from .settings import app_settings

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

class SettingsUpdate(BaseModel):
    fps_sampling: float = None
    recognition_fps: float = None
    similarity_threshold: float = None
    unknown_threshold: float = None
    tracker_distance_threshold: float = None
    exit_threshold_seconds: float = None
    stream_fps: float = None

@api_router.get("/settings")
def get_settings():
    return {
        "fps_sampling": app_settings.fps_sampling,
        "recognition_fps": app_settings.recognition_fps,
        "similarity_threshold": app_settings.similarity_threshold,
        "unknown_threshold": app_settings.unknown_threshold,
        "tracker_distance_threshold": app_settings.tracker_distance_threshold,
        "exit_threshold_seconds": app_settings.exit_threshold_seconds,
        "stream_fps": app_settings.stream_fps,
    }

@api_router.post("/settings")
def update_settings(req: SettingsUpdate):
    if req.fps_sampling is not None: app_settings.fps_sampling = req.fps_sampling
    if req.recognition_fps is not None: app_settings.recognition_fps = req.recognition_fps
    if req.similarity_threshold is not None: app_settings.similarity_threshold = req.similarity_threshold
    if req.unknown_threshold is not None: app_settings.unknown_threshold = req.unknown_threshold
    if req.tracker_distance_threshold is not None: app_settings.tracker_distance_threshold = req.tracker_distance_threshold
    if req.exit_threshold_seconds is not None: app_settings.exit_threshold_seconds = req.exit_threshold_seconds
    if req.stream_fps is not None: app_settings.stream_fps = req.stream_fps
    
    app_settings.save_to_db()
    
    camera_manager.fps_sampling = app_settings.fps_sampling
    camera_manager.recognition_engine.similarity_threshold = app_settings.similarity_threshold
    for tracker in camera_manager.trackers.values():
        tracker.track_distance_threshold = app_settings.tracker_distance_threshold
        tracker.track_expiry_seconds = app_settings.exit_threshold_seconds
        tracker.embedding_threshold = 1.0 - app_settings.unknown_threshold # approx mapping for distance/similarity interaction

    return {"status": "success"}

class CameraAddReq(BaseModel):
    name: str
    source: str

@api_router.get("/cameras")
def get_cameras():
    docs = list(cameras_col.find({}, {"_id": 0}))
    return docs

@api_router.post("/cameras")
def add_camera(req: CameraAddReq):
    import uuid
    cam_id = f"cam_{uuid.uuid4().hex[:6]}"
    doc = {
        "camera_id": cam_id,
        "camera_name": req.name,
        "camera_source": req.source,
        "status": "offline",
        "created_at": datetime.utcnow()
    }
    cameras_col.insert_one(doc)
    
    camera_manager.add_camera(cam_id, req.source)
    
    return {"status": "success", "camera": doc}

@api_router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: str):
    cameras_col.delete_one({"camera_id": camera_id})
    camera_manager.remove_camera(camera_id)
    return {"status": "success"}

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
        self.last_sent = time.time()

    async def recv(self):
        # Frame pacing based on dynamic settings
        current_time = time.time()
        target_fps = max(1.0, app_settings.stream_fps)
        sleep_time = (1.0 / target_fps) - (current_time - self.last_sent)
        if sleep_time > 0:
            await asyncio.sleep(sleep_time)

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
        
        self.last_sent = time.time()
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
