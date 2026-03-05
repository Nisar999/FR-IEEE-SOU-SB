import React from 'react';
import { getConfidenceColor } from '../../utils/demoDetections';
import styles from './RecognizedFaces.module.css';

/**
 * RecognizedFaces
 * Displays each detected face as its own card.
 *
 * Props:
 *   faces – array of face objects from detections state
 */
export default function RecognizedFaces({ faces = [] }) {
  const recognized = faces.filter((f) => !f.isUnknown).length;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <FaceIcon />
          RECOGNIZED FACES
        </div>
        <span className={styles.countBadge}>
          {recognized} / {faces.length}
        </span>
      </div>

      {/* Face cards */}
      <div className={styles.grid}>
        {faces.length === 0 ? (
          <EmptyState />
        ) : (
          faces.map((face) => <FaceCard key={face.id} face={face} />)
        )}
      </div>
    </div>
  );
}

function FaceCard({ face }) {
  const { initials, name, role, confidence, color, bgColor, borderColor, isUnknown, status } = face;
  const confColor = getConfidenceColor(confidence);

  return (
    <div className={`${styles.card} ${isUnknown ? styles.cardUnknown : styles.cardKnown}`}>
      {/* Left accent bar via CSS */}
      <div
        className={styles.avatar}
        style={{ background: bgColor, color, borderColor }}
      >
        {initials}
      </div>

      <div className={styles.details}>
        <div className={styles.name} style={isUnknown ? { color: 'var(--red)' } : {}}>
          {name}
        </div>
        <div className={styles.role}>{role}</div>
        <span className={`${styles.status} ${isUnknown ? styles.statusAlert : styles.statusIn}`}>
          {status}
        </span>
      </div>

      <div className={styles.right}>
        <div className={styles.confNum} style={{ color: confColor }}>{confidence}%</div>
        <div className={styles.confBar}>
          <div
            className={styles.confFill}
            style={{ width: `${confidence}%`, background: confColor }}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <FaceIcon size={38} />
      <p>No faces detected yet</p>
    </div>
  );
}

function FaceIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={size > 20 ? 1.5 : 2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
