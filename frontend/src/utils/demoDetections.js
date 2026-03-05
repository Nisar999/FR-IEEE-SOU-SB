/**
 * demoDetections.js
 *
 * Sample face data for demo / development.
 * ─────────────────────────────────────────────────────────────
 * HOW TO CONNECT YOUR REAL BACKEND:
 *   1. Replace the DEMO_FACES array with an API call to your
 *      Python/Flask or FastAPI face-recognition server.
 *   2. Your backend should return an array of objects matching
 *      the shape below.
 *   3. Call your API on an interval (e.g. every 500ms) inside
 *      CameraFeed.js and pass results to onDetectionUpdate().
 * ─────────────────────────────────────────────────────────────
 */

export const DEMO_FACES = [
  {
    id: 1,
    initials: 'AR',
    name: 'Ahmed Raza',
    role: 'Chair · IEEE Member',
    confidence: 97,
    color: '#1a6ef5',
    bgColor: '#e8f0fe',
    borderColor: 'rgba(26,110,245,0.35)',
    isUnknown: false,
    status: 'IN FRAME',
  },
  {
    id: 2,
    initials: 'SM',
    name: 'Sara Memon',
    role: 'Vice Chair · IEEE Member',
    confidence: 94,
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: 'rgba(22,163,74,0.35)',
    isUnknown: false,
    status: 'IN FRAME',
  },
  {
    id: 3,
    initials: 'ZK',
    name: 'Zain Khan',
    role: 'Secretary · IEEE Member',
    confidence: 89,
    color: '#ea580c',
    bgColor: '#fff1e6',
    borderColor: 'rgba(234,88,12,0.35)',
    isUnknown: false,
    status: 'IN FRAME',
  },
  {
    id: 4,
    initials: '?',
    name: 'Unknown #01',
    role: 'Unregistered person',
    confidence: 18,
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: 'rgba(220,38,38,0.5)',
    isUnknown: true,
    status: 'ALERT',
  },
  {
    id: 5,
    initials: 'AJ',
    name: 'Ali Javed',
    role: 'Faculty Lead · IEEE',
    confidence: 91,
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: 'rgba(22,163,74,0.35)',
    isUnknown: false,
    status: 'IN FRAME',
  },
];

/**
 * getConfidenceColor
 * Returns a CSS color string based on confidence value.
 */
export function getConfidenceColor(conf) {
  if (conf >= 80) return 'var(--green)';
  if (conf >= 50) return 'var(--orange)';
  return 'var(--red)';
}
