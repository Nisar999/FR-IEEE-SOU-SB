import React, { useEffect, useState } from 'react';
import { fetchTodayAttendance } from '../services/api';

export default function AttendanceList() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchTodayAttendance();
                setRecords(res.data);
            } catch (err) {
                console.error("Attendance fetch error", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return "--:--";
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="panel">
            <div className="panel-title">Today's Attendance Logs</div>
            <div className="list-container">
                {records.length === 0 ? (
                    <div className="item-sub" style={{ textAlign: "center", padding: "20px 0" }}>No records yet.</div>
                ) : (
                    records.map((rec, i) => (
                        <div key={i} className="list-item">
                            <div className="item-main">
                                <div className="item-name">{rec.person_name}</div>
                                <div className="item-sub">
                                    In: {formatTime(rec.entry_time)}
                                    {rec.exit_time ? ` | Out: ${formatTime(rec.exit_time)}` : ' | Active'}
                                </div>
                            </div>
                            <div className={`badge ${rec.status}`}>
                                {rec.status.toUpperCase()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
