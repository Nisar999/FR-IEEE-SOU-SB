# Smart Vision — IEEE SOU SB

Face detection & recognition monitoring dashboard built with **React + Vite**.

---

## 📁 Folder Structure

```
smart-vision/
│
├── index.html                  ← Vite entry HTML (at ROOT, not /public)
├── vite.config.js              ← Vite config (uses @vitejs/plugin-react)
├── package.json
│
└── src/
    ├── main.jsx                → React entry point (mounts App into #root)
    ├── App.jsx                 → Root: assembles all panels, holds shared state
    ├── App.module.css
    │
    ├── styles/
    │   └── globals.css         → CSS variables, resets, animations
    │
    ├── hooks/                  → Reusable logic (no JSX, plain .js)
    │   ├── useClock.js         → Live clock: returns { time, date }
    │   └── useCamera.js        → Webcam start/stop via getUserMedia
    │
    ├── utils/                  → Pure helpers (no JSX, plain .js)
    │   └── demoDetections.js   → Demo face data — REPLACE with your API
    │
    └── components/
        ├── layout/
        │   ├── Topbar.jsx + .module.css
        │   └── Sidebar.jsx + .module.css
        ├── camera/
        │   ├── CameraFeed.jsx + .module.css
        │   ├── CameraOffState.jsx + .module.css
        │   └── CameraStatsBar.jsx + .module.css
        ├── dashboard/
        │   └── HeadCount.jsx + .module.css
        ├── log/
        │   └── SystemLog.jsx + .module.css
        └── faces/
            └── RecognizedFaces.jsx + .module.css
```

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

---

## Why Vite over CRA?

| Feature          | CRA (old)           | Vite (now)              |
|------------------|---------------------|-------------------------|
| Dev server start | 10-30s              | Under 1s                |
| Hot reload       | Slow                | Instant                 |
| Config file      | Hidden inside CRA   | vite.config.js (simple) |
| Entry HTML       | public/index.html   | index.html at root      |
| Entry JS file    | src/index.js        | src/main.jsx            |

---

## Connecting Your Real Backend

Open `src/components/camera/CameraFeed.jsx` and replace `runDemoDetection()` with:

```js
useEffect(() => {
  if (!cameraOn) return
  const interval = setInterval(async () => {
    const res  = await fetch('http://localhost:5000/detections')
    const data = await res.json()
    const recognized = data.faces.filter(f => !f.isUnknown).length
    const unknown    = data.faces.filter(f =>  f.isUnknown).length
    onDetectionUpdate({
      total: data.faces.length, recognized, unknown,
      faces: data.faces, inferencems: data.inference_ms,
    })
  }, 500)
  return () => clearInterval(interval)
}, [cameraOn])
```
