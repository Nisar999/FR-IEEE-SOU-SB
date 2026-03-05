# CCTV Face Recognition System

Production-ready CCTV Face Recognition system running on CPU using Python, FastAPI, InsightFace, MongoDB, and a Vite React Dashboard.

## Features

- Multi-stream RTSP Camera Threading and Frame Downsampling (1 FPS target).
- InsightFace (`buffalo_l`) arcface embedding extraction on CPU.
- Tracker algorithm reducing recognition noise.
- Lifecycle Engine monitoring Entry, Active, Exits, and Visits. 
- Auto Unknown Identity detection based on a `0.4` threshold, keeping unpromoted identities for 180m.
- Dashboard with Live Headcount, Camera Monitoring, Person History, Attendance Daily logs, and Unknown Identity Promotion tool.
- Protected Routes using JWT/LocalStorage style simulation `/login`. Default credentials: `SOU` / `sahana@sou`.

## Directory Structure

- `backend/`: FastAPI Python implementation of the face recognition logic and HTTP APis.
- `docker/`: Build recipes for `face-recognition-service` and `mongodb` clustering.
- `frontend/`: The React Dashboard (using Vite) integrating everything via `/login` to backend APIs.

## Setup Requirements
Ensure you have the following installed:
- Python 3.10+
- Node.js & npm (v18+)
- MongoDB (Running locally on port 27017 or via docker-compose)
- Docker & Docker Compose (If running via containers)

## Native Run Guide

### 1. Database
If running locally without docker, install MongoDB and ensure it runs on `localhost:27017`.

### 2. Backend API
Open a terminal in the root folder:
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
Make sure `backend/config/cameras.yaml` is updated with your target real or simulated RTSP URLs:
```yaml
cam_01: rtsp://localhost:8554/mystream
```
You can generate test datasets using the InsightFace library into `backend/embeddings/embeddings_averaged.pkl`. (A dictionary mapping string name to 1D `numpy.array` embeddings).

Start it:
```bash
python start_backend.py
```
> Server starts on `http://localhost:8000`. API Docs available at `http://localhost:8000/docs`.

### 3. Frontend Dashboard
Open a new terminal in the root folder:
```bash
cd frontend
npm install
npm run dev
```
> Access application at `http://localhost:5173`.
> Login as `SOU` with password `sahana@sou`.

## Docker Compose
```bash
cd docker
docker-compose up -d --build
```
This spins up both MongoDB and the face recognition service simultaneously. The backend will map volumes to `/backend/config` and `/backend/embeddings` respectively.

Ensure the `frontend` is run locally targeting `http://localhost:8000` from `.env` or direct mapping as shown.
