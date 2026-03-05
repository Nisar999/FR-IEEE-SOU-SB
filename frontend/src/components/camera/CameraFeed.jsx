import React, { useEffect, useRef } from 'react';
import useCamera from '../../hooks/useCamera';
import { DEMO_FACES } from '../../utils/demoDetections';
import CameraOffState from './CameraOffState';
import CameraStatsBar from './CameraStatsBar';
import styles from './CameraFeed.module.css';

/**
 * CameraFeed
 * Shows the live webcam feed (or an off-state placeholder).
 * Handles camera on/off toggle and passes detection updates to App.
 *
 * Props:
 *   onDetectionUpdate(data) – called whenever detections change
 *   onCameraToggle(isOn)    – called when camera turns on/off
 *   onLog(type, message)    – called to add a system log entry
 */
export default function CameraFeed({ onDetectionUpdate, onCameraToggle, onLog }) {
  const { videoRef, cameraOn, error, startCamera, stopCamera } = useCamera();

  // Track demo detection timeout IDs so we can cancel on stop
  const demoTimersRef = useRef([]);

  async function handleToggle() {
    if (cameraOn) {
      // Cancel any pending demo timers
      demoTimersRef.current.forEach(clearTimeout);
      demoTimersRef.current = [];

      stopCamera();
      onCameraToggle(false);
      onLog('INFO', 'Camera stopped. Session ended.');
    } else {
      const ok = await startCamera();
      if (ok) {
        onCameraToggle(true);
        onLog('INFO', 'Camera connected. Live feed active.');
        onLog('INFO', 'Face recognition engine initialized. Scanning...');
        runDemoDetection();
      } else {
        onLog('ALERT', 'Camera access denied. Grant browser permission and retry.');
      }
    }
  }

  /**
   * runDemoDetection
   * Simulates faces being detected one-by-one with delays.
   *
   * ─── HOW TO REPLACE WITH REAL BACKEND ──────────────────────
   * Delete this function and instead poll your Python/Flask API:
   *
   *   useEffect(() => {
   *     if (!cameraOn) return;
   *     const interval = setInterval(async () => {
   *       const res  = await fetch('http://localhost:5000/detections');
   *       const data = await res.json();
   *       onDetectionUpdate(buildDetectionPayload(data.faces));
   *     }, 500);
   *     return () => clearInterval(interval);
   *   }, [cameraOn]);
   * ────────────────────────────────────────────────────────────
   */
  function runDemoDetection() {
    let accumulated = [];
    let delay = 0;

    DEMO_FACES.forEach((face) => {
      const tid = setTimeout(() => {
        accumulated = [...accumulated, face];
        const recognized = accumulated.filter((f) => !f.isUnknown).length;
        const unknown    = accumulated.filter((f) => f.isUnknown).length;

        onDetectionUpdate({
          total:       accumulated.length,
          recognized,
          unknown,
          faces:       accumulated,
          inferencems: 97,
        });

        if (face.isUnknown) {
          onLog('ALERT', 'Unknown face detected at CAM-01. Security notified.');
        } else {
          onLog('OK', `<b>${face.name}</b> recognized. Confidence: ${face.confidence}%.`);
        }
      }, delay);

      demoTimersRef.current.push(tid);
      delay += 1400;
    });
  }

  // Clean up timers if component unmounts while camera is on
  useEffect(() => {
    return () => {
      demoTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <VideoIcon />
          LIVE CAMERA FEED — MAIN HALL
        </div>
        <div className={styles.controls}>
          <span className={styles.badgeCam}>CAM-01 · 1080p</span>
          <span className={cameraOn ? styles.badgeLive : styles.badgeOff}>
            {cameraOn ? '● LIVE' : '● OFFLINE'}
          </span>
          <button
            className={cameraOn ? styles.btnStop : styles.btnStart}
            onClick={handleToggle}
          >
            <VideoIcon />
            {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </button>
        </div>
      </div>

      {/* Camera body */}
      <div className={styles.body}>
        {/* Off-state placeholder */}
        {!cameraOn && <CameraOffState error={error} />}

        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`${styles.video} ${cameraOn ? styles.videoVisible : ''}`}
        />

        {/* Overlay info bar (top-left) */}
        <div className={styles.infoBar}>
          <span className={styles.camTag}>CAM-01 — MAIN HALL</span>
          {cameraOn && <span className={styles.recBadge}>⬤ REC</span>}
        </div>

        {/* Stats bar (bottom) */}
        {cameraOn && <CameraStatsBar />}
      </div>
    </div>
  );
}

function VideoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}
