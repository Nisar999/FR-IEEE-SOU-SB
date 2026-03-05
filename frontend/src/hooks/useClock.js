import { useState, useEffect } from 'react';

const DAYS   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatClock() {
  const now = new Date();
  const p   = (n) => String(n).padStart(2, '0');
  return {
    time: `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`,
    date: `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
  };
}

/**
 * useClock
 * Returns { time, date } updating every second.
 */
export default function useClock() {
  const [tick, setTick] = useState(formatClock);

  useEffect(() => {
    const id = setInterval(() => setTick(formatClock()), 1000);
    return () => clearInterval(id);
  }, []);

  return tick;
}
