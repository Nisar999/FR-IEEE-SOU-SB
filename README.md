# CCTV Face Recognition System — SOU IEEE SB

A production-ready, CPU-optimized CCTV Face Recognition and Analytics Platform built for real-time surveillance, attendance tracking, and identity management. Developed for the **SOU IEEE Student Branch**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **Face Recognition** | InsightFace (`buffalo_l` model), ONNX Runtime |
| **Tracking** | Custom Hungarian Algorithm Tracker (`scipy`) |
| **Video Streaming** | WebRTC via `aiortc` / `av`, MJPEG fallback |
| **Camera Input** | OpenCV (`cv2`), RTSP / USB / Webcam |
| **Database** | MongoDB (`pymongo`) |
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS v4 |
| **UI Components** | Shadcn UI (Radix UI primitives) |
| **Charts** | Recharts |
| **HTTP Client** | Axios |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                  │
│                                                      │
│  CameraManager (Singleton)                           │
│  ├── Camera Worker Thread (per camera)               │
│  │   └── OpenCV RTSP/USB capture → frame_lock       │
│  ├── Processing Worker Thread (per camera)           │
│  │   ├── RecognitionEngine (InsightFace buffalo_l)   │
│  │   ├── FaceTracker (Hungarian Algorithm)           │
│  │   └── LifecycleEngine (Entry/Exit/Visit)          │
│  └── WebRTC Track (aiortc, per peer connection)      │
│                                                      │
│  REST API Endpoints (/health, /live-headcount, ...)  │
│  WebRTC Signaling (/offer)                           │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / WebRTC
┌───────────────────────▼─────────────────────────────┐
│               Frontend (Vite + React 19)             │
│                                                      │
│  Login (role-based: admin / user)                    │
│  ├── Dashboard  → Live Headcount + VideoStream       │
│  ├── Cameras & Config  (admin only)                  │
│  ├── Registry Logs  (admin only)                     │
│  └── Settings Panel  (admin only)                    │
└─────────────────────────────────────────────────────┘
```

---

## Features

### Face Recognition Engine
- **InsightFace `buffalo_l`** model with ArcFace embedding extraction (512-dim).
- **CPU-only** inference using `CPUExecutionProvider` (no CUDA dependencies).
- Detection resolution: `320×320` for optimal CPU throughput.
- Cosine similarity matching against a pre-built embedding `.pkl` store.
- Configurable similarity threshold (default `0.45`, tunable via dashboard).
- Supports two embedding formats: standard dict-with-lists, and averaged embeddings dict.

### Multi-Camera Management
- **Per-camera thread architecture**: one capture thread + one processing thread per camera.
- Accepts **RTSP streams**, **local device indices** (e.g. `0`, `1`), and USB webcams.
- Frame buffer reduced to `1` to minimize latency on live streams.
- Auto-reconnection on stream drop with 5-second retry delay.
- Scales to multiple cameras simultaneously without shared state race conditions.
- Camera resolution downsampled to `640×360` for processing efficiency.

### Hungarian Algorithm Face Tracker
- Custom implementation using `scipy.optimize.linear_sum_assignment`.
- **Dual matching strategy**: primary spatial distance (pixel center), fallback on embedding cosine similarity.
- Configurable distance threshold (default `120px`).
- Identity upgrade: tracks smoothly transition from `Unknown → Known` when identity is confirmed.
- Confidence hysteresis: identity only updates if new confidence is `>0.05` higher than current.
- Maintains tracks across frames where face is temporarily not detected.

### Lifecycle Engine
- Tracks full person lifecycle: **Entry → Active → Exit** with timestamps stored in MongoDB.
- **Thread-safe** using `threading.RLock` for multi-camera concurrent updates.
- Deduplication: if two track IDs resolve to the same identity, the lower-confidence one is merged.
- Identity can be upgraded mid-session (Unknown → Known) without creating a new record.
- `visit_count` and `avg_confidence` computed and stored per attendance record.

### Unknown Identity Clustering
- Unknowns are automatically clustered by **cosine similarity** (threshold default `0.35`).
- Each unknown gets a unique ID (`unknown_<8-char hex>`).
- Embedding is updated using **exponential smoothing** (`80%` old + `20%` new) to adapt across different angles and lighting.
- Unknown clusters expire after **180 minutes** of inactivity.
- Admin can **promote** any unknown to a named identity directly from the dashboard. Promotion reloads embeddings live.

### WebRTC Video Streaming
- Backend exposes a `/offer` WebRTC signaling endpoint (SDP offer/answer).
- Per-camera `CameraStreamTrack` (aiortc `VideoStreamTrack`) streams processed frames with bounding boxes overlaid.
- Frames are converted from `BGR → RGB` before encoding to prevent black-frame issues in Chrome.
- Stream FPS is dynamically configurable from the dashboard settings (default `15 FPS`).
- Falls back to a blank frame if the camera is not yet initialized.
- Debug frame available via `/debug-frame` (JPEG snapshot of the latest processed frame).

### MongoDB Data Layer
- **6 collections**: `persons`, `attendance_logs`, `unknown_archive`, `camera_status`, `cameras`, `settings`.
- All write operations wrapped with a **retry decorator** (3 retries, 1s delay) for connection resilience.
- Settings persisted to DB: all runtime parameters (FPS, thresholds, etc.) survive restarts.
- Cameras dynamically added/removed via API and stored in DB for persistence.
- Proper indexes: `persons.name` (unique), `attendance_logs(person_name, status)`, `unknown_archive.unknown_id` (unique).

### REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/live-headcount` | Current known + unknown counts |
| `GET` | `/active-persons` | All active track IDs with identity info |
| `GET` | `/today-attendance` | All attendance records for today |
| `GET` | `/person-history/{name}` | Full history for a named person |
| `GET` | `/unknown-persons` | All unpromoted unknowns |
| `POST` | `/promote-unknown` | Promote unknown to named identity |
| `GET` | `/camera-status` | Status of all cameras |
| `GET/POST` | `/settings` | Read and update runtime system settings |
| `GET/POST` | `/cameras` | List cameras / add a new camera |
| `DELETE` | `/cameras/{id}` | Remove a camera |
| `POST` | `/offer` | WebRTC SDP offer for a specific camera stream |
| `GET` | `/debug-frame` | Latest processed JPEG frame |

### Frontend Dashboard
- **Role-based authentication**: `admin` (full access) and `user` (dashboard-only) roles.
- Default credentials: username `SOU`, password `sahana@sou`.
- Dark mode by default, with a light mode toggle.
- Built with **React 19 + TypeScript + Vite 7 + Tailwind CSS v4**.
- UI Components from **Shadcn UI** (Radix primitives).

#### Dashboard Panels
| Tab | Role | Contents |
|---|---|---|
| **Dashboard** | All | Live headcount widget, WebRTC video stream, active person list |
| **Cameras & Config** | Admin | Add/delete/monitor cameras by RTSP or device index |
| **Registry Logs** | Admin | Attendance history, person history lookup, unknown identity promotion |
| **Settings** | Admin | Live-tune FPS, similarity thresholds, exit timeout, stream FPS |

---

## Directory Structure

```
FR-Final/
├── backend/
│   ├── app/
│   │   ├── api.py              # REST API + WebRTC signaling
│   │   ├── camera_manager.py   # Multi-camera threading (Singleton)
│   │   ├── database.py         # MongoDB layer, collections, retry logic
│   │   ├── face_tracker.py     # Hungarian Algorithm tracker
│   │   ├── lifecycle_engine.py # Entry/Exit/Visit state machine
│   │   ├── main.py             # FastAPI app, CORS, startup/shutdown
│   │   ├── recognition_engine.py  # InsightFace inference engine
│   │   └── settings.py         # DB-backed singleton settings
│   ├── config/
│   │   └── cameras.yaml        # Initial camera seed config (optional)
│   ├── embeddings/
│   │   └── embeddings.pkl      # Pre-built face embedding store
│   ├── requirements.txt
│   └── start_backend.py        # Entry point — starts cameras + Uvicorn
├── frontend/
│   ├── src/
│   │   ├── components/         # Dashboard, Login, VideoStream, Settings, etc.
│   │   ├── services/           # Axios API service layer
│   │   ├── hooks/              # React custom hooks
│   │   └── App.tsx             # Root app with tab routing
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── docker/
    └── docker-compose.yml      # MongoDB + backend containers
```

---

## Setup & Installation

### Prerequisites
- Python `3.10+`
- Node.js `v18+` and npm
- MongoDB running on `localhost:27017` (or via Docker)
- Docker & Docker Compose (for containerized deployment)

---

### 1. Database

Run MongoDB locally or via Docker:

```bash
# Using Docker (quick start)
docker run -d -p 27017:27017 --name mongo mongo:latest

# Or via docker-compose (recommended)
cd docker
docker-compose up -d mongodb
```

---

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Cameras

Cameras are stored in MongoDB and managed via the dashboard, but you can also configure the initial `cameras.yaml` to pre-seed for reference.

Edit `backend/config/cameras.yaml`:
```yaml
cam_01: "rtsp://user:pass@192.168.0.5:554/unicast/c1/s0/live"
# cam_02: 0   # Local webcam device index
```

#### Prepare Embeddings

Generate and save your face embeddings as a `.pkl` file at:
```
backend/embeddings/embeddings.pkl
```

Expected format — either:
```python
# Format 1: Averaged per-identity dict
{ "John Doe": np.array([...512 floats...]), ... }

# Format 2: Multi-embedding dict
{ "embeddings": [...], "names": [...] }
```

#### Start Backend

```bash
python start_backend.py
```

> **API Server**: `http://localhost:8000`
> **Swagger Docs**: `http://localhost:8000/docs`

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Dashboard**: `http://localhost:5173`
> **Login**: username `SOU` / password `sahana@sou`

---

## Docker Compose Deployment

```bash
cd docker
docker-compose up -d --build
```

This starts:
- `mongodb` on port `27017`
- `face-recognition-service` (FastAPI backend) on port `8000`

The backend will mount:
- `./backend/config` → `/app/config`
- `./backend/embeddings` → `/app/embeddings`

> **Note**: Run the frontend locally and point it to `http://localhost:8000` or configure `VITE_API_URL` in `.env`.

---

## Configurable Runtime Settings (via Dashboard)

All settings are persisted to MongoDB and take effect immediately without restart:

| Setting | Default | Description |
|---|---|---|
| `fps_sampling` | `10.0` | Frames per second to run recognition on |
| `similarity_threshold` | `0.45` | Cosine similarity required to confirm identity |
| `unknown_threshold` | `0.35` | Cosine similarity for unknown clustering |
| `tracker_distance_threshold` | `120px` | Max spatial distance for track matching |
| `exit_threshold_seconds` | `5.0s` | Time before a track is considered exited |
| `stream_fps` | `15.0` | WebRTC video stream frame rate |

---

## Notes

- The system does **not** require a GPU. All inference runs on CPU via ONNX Runtime.
- For production RTSP streams, ensure the camera URL is accessible from the backend machine.
- `cameras.yaml` is only used as a reference; cameras are actually managed via the REST API and stored in MongoDB.
- The WebRTC streaming requires direct network access between the browser client and the backend server (no relay by default).
