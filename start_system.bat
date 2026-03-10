@echo off
echo Starting SOU Face Recognition CCTV System...

REM Start MongoDB if it's a service (optional but good for Windows)
echo Checking MongoDB...
net start MongoDB 2>nul

REM Start Backend
echo Starting FastAPI Backend...
start cmd /k "cd d:\Code_yees\Projects-SOU\FR-Final\backend && .\venv\Scripts\activate && pip install -r requirements.txt && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a bit for backend to initialize
timeout /t 5 /nobreak

REM Start Frontend
echo Starting Next.js Frontend...
start cmd /k "cd d:\Code_yees\Projects-SOU\FR-Final\frontend && npm install && npm run dev"

echo System started! Both backend and frontend will run in separate windows.
pause
