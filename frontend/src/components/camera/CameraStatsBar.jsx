import React from 'react';
import styles from './CameraStatsBar.module.css';

/**
 * CameraStatsBar
 * Floating stats bar at the bottom of the live camera feed.
 * Stats are read from global CSS (no props needed).
 * If you have live data, pass it as props and display here.
 */
export default function CameraStatsBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.stat}>IN FRAME <b>—</b></span>
      <span className={styles.stat}>RECOGNIZED <b>—</b></span>
      <span className={styles.stat}>UNKNOWN <b>—</b></span>
      <span className={`${styles.stat} ${styles.fps}`}>LIVE · 30 FPS</span>
    </div>
  );
}
