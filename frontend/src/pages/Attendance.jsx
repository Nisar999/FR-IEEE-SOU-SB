import React, { useState, useEffect } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import useClock from '../hooks/useClock';
import styles from '../App.module.css';
import axios from 'axios';

export default function Attendance() {
    const { time, date } = useClock();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/today-attendance')
            .then(res => setLogs(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className={styles.app}>
            <Topbar time={time} date={date} title="Attendance" />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content} style={{ backgroundColor: '#0f172a', padding: '2rem', color: 'white' }}>
                    <h2>Today's Attendance Logs</h2>
                    <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Camera ID</th>
                                <th style={{ padding: '0.75rem' }}>Entry Time</th>
                                <th style={{ padding: '0.75rem' }}>Exit Time</th>
                                <th style={{ padding: '0.75rem' }}>Duration (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '0.75rem' }}>{log.person_name}</td>
                                    <td style={{ padding: '0.75rem' }}>{log.camera_id}</td>
                                    <td style={{ padding: '0.75rem' }}>{new Date(log.entry_time).toLocaleTimeString()}</td>
                                    <td style={{ padding: '0.75rem' }}>{log.exit_time ? new Date(log.exit_time).toLocaleTimeString() : 'Active'}</td>
                                    <td style={{ padding: '0.75rem' }}>{Math.round(log.duration_seconds || 0)}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No attendance records for today.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    );
}
