import React, { useState, useEffect } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import useClock from '../hooks/useClock';
import styles from '../App.module.css';
import axios from 'axios';

export default function UnknownManager() {
    const { time, date } = useClock();
    const [unknowns, setUnknowns] = useState([]);
    const [promoteData, setPromoteData] = useState({ id: '', name: '' });

    useEffect(() => {
        fetchUnknowns();
    }, []);

    const fetchUnknowns = async () => {
        try {
            const res = await axios.get('http://localhost:8000/unknown-persons');
            setUnknowns(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePromote = async (e) => {
        e.preventDefault();
        if (!promoteData.id || !promoteData.name) return;
        try {
            await axios.post('http://localhost:8000/promote-unknown', {
                unknown_id: promoteData.id,
                known_name: promoteData.name
            });
            alert(`Successfully promoted ${promoteData.id} to ${promoteData.name}`);
            setPromoteData({ id: '', name: '' });
            fetchUnknowns(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Error promoting identity');
        }
    };

    return (
        <div className={styles.app}>
            <Topbar time={time} date={date} title="Manage Unknown Identities" />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content} style={{ backgroundColor: '#0f172a', padding: '2rem', color: 'white' }}>
                    <h2>Unknown Identities</h2>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3>Current Unknowns</h3>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {unknowns.map((u, i) => (
                                    <li key={i} style={{ backgroundColor: '#1e293b', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', cursor: 'pointer', border: promoteData.id === u.unknown_id ? '2px solid #3b82f6' : '1px solid transparent' }} onClick={() => setPromoteData({ ...promoteData, id: u.unknown_id })}>
                                        <p><strong>ID:</strong> {u.unknown_id}</p>
                                        <p><strong>First Seen:</strong> {new Date(u.first_seen).toLocaleString()}</p>
                                        <p><strong>Last Seen:</strong> {new Date(u.last_seen).toLocaleString()}</p>
                                        <p><strong>Avg Confidence:</strong> {u.avg_confidence.toFixed(2)}</p>
                                    </li>
                                ))}
                                {unknowns.length === 0 && <p>No unknown entries to review.</p>}
                            </ul>
                        </div>

                        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', height: 'fit-content' }}>
                            <h3>Promote Identity</h3>
                            <form onSubmit={handlePromote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Selected Unknown ID</label>
                                    <input
                                        type="text"
                                        value={promoteData.id}
                                        readOnly
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#94a3b8' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Real Name</label>
                                    <input
                                        type="text"
                                        value={promoteData.name}
                                        onChange={e => setPromoteData({ ...promoteData, name: e.target.value })}
                                        placeholder="Enter true person name..."
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!promoteData.id || !promoteData.name}
                                    style={{ padding: '0.75rem', backgroundColor: promoteData.id && promoteData.name ? '#3b82f6' : '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: promoteData.id && promoteData.name ? 'pointer' : 'not-allowed' }}
                                >
                                    Promote to Known
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
