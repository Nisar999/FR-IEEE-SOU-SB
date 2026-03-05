import React from 'react';
import styles from './Topbar.module.css';

/**
 * Topbar
 * Top navigation bar — brand, system status, clock, user info.
 *
 * Props:
 *   time  – formatted time string  e.g. "16:53:32"
 *   date  – formatted date string  e.g. "TUE, FEB 24, 2026"
 */
export default function Topbar({ time, date }) {
  return (
    <header className={styles.topbar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <EyeIcon />
        </div>
        <div className={styles.brandText}>
          <h1>SMART VISION</h1>
          <p>IEEE SOU SB · MONITORING SYSTEM</p>
        </div>
      </div>

      {/* Status pill */}
      <div className={styles.statusPill}>
        <span className={styles.statusDot} />
        ALL SYSTEMS OPERATIONAL
      </div>

      {/* Right: clock + user */}
      <div className={styles.right}>
        <div>
          <div className={styles.clock}>{time}</div>
          <div className={styles.date}>{date}</div>
        </div>

        <div className={styles.userBadge}>
          <div className={styles.avatar}>AR</div>
          <span>Admin</span>
        </div>

        <button className={styles.logoutBtn}>⊣ Logout</button>
      </div>
    </header>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  );
}
