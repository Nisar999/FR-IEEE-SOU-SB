import React, { useState } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import useClock from '../hooks/useClock';
import styles from '../App.module.css';
import axios from 'axios';

export default function Persons() {
    const { time, date } = useClock();
    const [searchName, setSearchName] = useState('');
    const [history, setHistory] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchName) return;
        try {
            const res = await axios.get(`http://localhost:8000/person-history/${searchName}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.app}>
            <Topbar time={time} date={date} title="Person History" />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content} style={{ backgroundColor: '#0f172a', padding: '2rem', color: 'white' }}>
                    <h2>Search Person History</h2>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Enter person name..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white' }}
                        />
                        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                    </form>

                    <div style={{ marginTop: '2rem' }}>
                        {history.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {history.map((record, i) => (
                                    <li key={i} style={{ backgroundColor: '#1e293b', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                                        <p><strong>Camera:</strong> {record.camera_id}</p>
                                        <p><strong>Entry:</strong> {new Date(record.entry_time).toLocaleString()}</p>
                                        <p><strong>Exit:</strong> {record.exit_time ? new Date(record.exit_time).toLocaleString() : 'Active'}</p>
                                        <p><strong>Duration:</strong> {Math.round(record.duration_seconds || 0)} seconds</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No history found for this person.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
