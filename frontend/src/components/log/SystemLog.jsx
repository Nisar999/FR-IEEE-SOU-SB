import React from 'react';
import styles from './SystemLog.module.css';

/**
 * SystemLog
 * Displays live system events and detection stats summary.
 *
 * Props:
 *   entries    – array of { id, type, message, timestamp }
 *   detections – { total, recognized, unknown, inferencems }
 *   onClear()  – clears all log entries
 */
export default function SystemLog({ entries, detections, onClear }) {
  const { total = 0, recognized = 0, unknown = 0, inferencems = null } = detections;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <ActivityIcon />
          SYSTEM LOG
        </div>
        <div className={styles.headerRight}>
          <span className={styles.count}>{entries.length} Entries</span>
          <button className={styles.clearBtn} onClick={onClear}>CLEAR</button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className={styles.statsBar}>
        <StatCell label="IN FRAME"   value={total}       color="var(--text)" />
        <StatCell label="RECOGNIZED" value={recognized}  color="var(--green)" />
        <StatCell label="UNKNOWN"    value={unknown}      color="var(--red)" />
        <StatCell
          label="INFERENCE"
          value={inferencems !== null ? inferencems : '—'}
          suffix={inferencems !== null ? 'ms' : ''}
          color="var(--accent)"
        />
      </div>

      {/* Log entries */}
      <div className={styles.entries}>
        {entries.length === 0 ? (
          <div className={styles.empty}>No entries yet. Turn on camera to begin.</div>
        ) : (
          entries.map((entry) => (
            <LogEntry key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, suffix = '', color }) {
  return (
    <div className={styles.statCell}>
      <div className={styles.statVal} style={{ color }}>
        {value}
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

const BADGE_CLASS = {
  OK:    'badgeOk',
  INFO:  'badgeInfo',
  WARN:  'badgeWarn',
  ALERT: 'badgeAlert',
};

function LogEntry({ entry }) {
  const { type, message, timestamp } = entry;
  return (
    <div className={styles.entry}>
      <span className={styles.time}>{timestamp}</span>
      <span className={`${styles.badge} ${styles[BADGE_CLASS[type] || 'badgeInfo']}`}>{type}</span>
      {/* dangerouslySetInnerHTML used only for controlled bold tags in log messages */}
      <span className={styles.message} dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
