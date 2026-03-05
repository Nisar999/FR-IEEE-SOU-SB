import React, { useState, useEffect } from 'react';
import styles from './HeadCount.module.css';

const CAPACITY = 50;

/**
 * HeadCount
 * Displays live occupancy statistics.
 *
 * Props:
 *   detections – { total, recognized, unknown } from App state
 *   cameraOn   – boolean
 */
export default function HeadCount({ detections, cameraOn }) {
  const { total = 0, recognized = 0, unknown = 0 } = detections;
  const [peak, setPeak] = useState(0);

  // Track peak count during the session
  useEffect(() => {
    if (total > peak) setPeak(total);
  }, [total, peak]);

  // Reset peak when camera turns off
  useEffect(() => {
    if (!cameraOn) setPeak(0);
  }, [cameraOn]);

  const occupancyPct = Math.round((total / CAPACITY) * 100);
  const donutDeg     = Math.round((occupancyPct / 100) * 360);

  const donutBg = `conic-gradient(var(--accent) ${donutDeg}deg, var(--bg2) ${donutDeg}deg)`;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <PeopleIcon />
          HEAD COUNT
        </div>
        <span className={cameraOn ? styles.badgeLive : styles.badgeOff}>
          {cameraOn ? '● LIVE' : '● STANDBY'}
        </span>
      </div>

      <div className={styles.body}>
        {/* Donut ring */}
        <div className={styles.donutWrap}>
          <div className={styles.donutRing} style={{ background: donutBg }}>
            <div className={styles.donutInner}>
              <span className={styles.donutNum}>{total}</span>
              <span className={styles.donutSub}>PRESENT</span>
            </div>
          </div>
          <span className={styles.donutLabel}>of {CAPACITY} capacity</span>
        </div>

        {/* Stats rows */}
        <div className={styles.stats}>
          <StatRow color="var(--green)"  label="Recognized" value={recognized} valueColor="var(--green)" />
          <StatRow color="var(--red)"    label="Unknown"    value={unknown}    valueColor="var(--red)" />
          <StatRow color="var(--text3)"  label="Capacity"   value={CAPACITY}   valueColor="var(--text)" />
          <StatRow color="var(--orange)" label="Peak Today" value={peak}       valueColor="var(--orange)" />
        </div>

        {/* Occupancy bar */}
        <div className={styles.occSection}>
          <div className={styles.occHeader}>
            <span>OCCUPANCY</span>
            <span>{occupancyPct}%</span>
          </div>
          <div className={styles.occTrack}>
            <div className={styles.occFill} style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ color, label, value, valueColor }) {
  return (
    <div className={styles.statRow}>
      <div className={styles.statLeft}>
        <span className={styles.dot} style={{ background: color }} />
        <span className={styles.statLabel}>{label}</span>
      </div>
      <span className={styles.statValue} style={{ color: valueColor }}>{value}</span>
    </div>
  );
}

function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
