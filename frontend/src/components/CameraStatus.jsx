import React, { useEffect, useState } from 'react';
import { fetchCameraStatus } from '../services/api';

export default function CameraStatus() {
    const [cameras, setCameras] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchCameraStatus();
                setCameras(res.data);
            } catch (err) {
                console.error("Camera status fetch error", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="panel">
            <div className="panel-title">System Status</div>
            <div className="list-container">
                {cameras.length === 0 ? (
                    <div className="item-sub">No cameras configured.</div>
                ) : (
                    cameras.map((c, i) => (
                        <div key={i} className="list-item">
                            <div className="item-main">
                                <div className="item-name">Camera: {c.camera_id}</div>
                                <div className="item-sub">Updated: {new Date(c.last_updated).toLocaleTimeString()}</div>
                                {c.error && <div style={{ color: "var(--danger-color)", fontSize: "12px", marginTop: "4px" }}>Error: {c.error}</div>}
                            </div>
                            <div className={`badge ${c.status === 'active' ? 'active' : 'completed'}`} style={{
                                backgroundColor: c.status === 'active' ? 'rgba(46, 160, 67, 0.2)' : (c.status === 'error' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(139, 148, 158, 0.2)'),
                                color: c.status === 'active' ? 'var(--success-color)' : (c.status === 'error' ? 'var(--danger-color)' : 'var(--text-secondary)')
                            }}>
                                {c.status.toUpperCase()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
