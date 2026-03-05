import React from 'react';
import styles from './CameraOffState.module.css';

/**
 * CameraOffState
 * Shown in the camera body when the camera is turned off.
 *
 * Props:
 *   error – optional error string to display
 */
export default function CameraOffState({ error }) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
          <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
        </svg>
      </div>

      {error ? (
        <>
          <p className={styles.errorText}>{error}</p>
          <small>Check browser permissions and try again.</small>
        </>
      ) : (
        <>
          <p>Camera is Off</p>
          <small>Press "Turn On Camera" to connect to your device camera</small>
        </>
      )}
    </div>
  );
}
