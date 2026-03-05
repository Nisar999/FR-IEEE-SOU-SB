import React, { useState, useEffect } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import CameraFeed from '../components/camera/CameraFeed';
import HeadCount from '../components/dashboard/HeadCount';
import SystemLog from '../components/log/SystemLog';
import RecognizedFaces from '../components/faces/RecognizedFaces';
import useClock from '../hooks/useClock';
import styles from '../App.module.css';

export default function Dashboard() {
    const { time, date } = useClock();

    const [detections, setDetections] = useState({
        total: 0,
        recognized: 0,
        unknown: 0,
        faces: [],
        inferencems: null,
    });

    const [logEntries, setLogEntries] = useState([]);
    const [cameraOn, setCameraOn] = useState(false);

    // Poll FastAPI for live headcount
    useEffect(() => {
        const fetchHeadcount = async () => {
            try {
                const res = await fetch('http://localhost:8000/live-headcount');
                if (res.ok) {
                    const data = await res.json();
                    // Merge with detections if needed, though they are currently driven by CameraFeed local simulate.
                    // For a real setup, Dashboard might just display stats from backend instead of CameraFeed directly.
                    // Due to template structure, we'll keep both or log it.
                }
            } catch (e) {
                console.error("Backend not reachable for headcount");
            }
        };

        // fetchHeadcount();
        // const interval = setInterval(fetchHeadcount, 2000);
        // return () => clearInterval(interval);
    }, []);

    function addLog(type, message) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        setLogEntries((prev) => [{ id: Date.now(), type, message, timestamp }, ...prev].slice(0, 20));
    }

    function handleDetectionUpdate(data) {
        setDetections(data);
    }

    function handleCameraToggle(isOn) {
        setCameraOn(isOn);
        if (!isOn) {
            setDetections({ total: 0, recognized: 0, unknown: 0, faces: [], inferencems: null });
        }
    }

    function clearLog() {
        setLogEntries([]);
    }

    return (
        <div className={styles.app}>
            <Topbar time={time} date={date} />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content}>
                    <div className={styles.row1}>
                        <CameraFeed
                            onDetectionUpdate={handleDetectionUpdate}
                            onCameraToggle={handleCameraToggle}
                            onLog={addLog}
                        />
                        <HeadCount detections={detections} cameraOn={cameraOn} />
                    </div>
                    <div className={styles.row2}>
                        <SystemLog
                            entries={logEntries}
                            detections={detections}
                            onClear={clearLog}
                        />
                        <RecognizedFaces faces={detections.faces} />
                    </div>
                </main>
            </div>
        </div>
    );
}
