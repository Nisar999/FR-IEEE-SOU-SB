from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import api_router, camera_manager
from .database import init_db

app = FastAPI(title="SOU Face Recognition CCTV System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def startup_event():
    init_db()
    # Let external script start background tasks to prevent auto-reloader issues during dev
    pass

@app.on_event("shutdown")
def shutdown_event():
    camera_manager.stop_all()
