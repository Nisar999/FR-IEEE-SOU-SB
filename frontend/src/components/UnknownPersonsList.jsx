import React, { useEffect, useState } from 'react';
import { fetchUnknownPersons, promoteUnknown } from '../services/api';

export default function UnknownPersonsList() {
    const [unknowns, setUnknowns] = useState([]);
    const [promoteName, setPromoteName] = useState({});

    const loadUnknowns = async () => {
        try {
            const res = await fetchUnknownPersons();
            setUnknowns(res.data);
        } catch (err) {
            console.error("Failed to load unknown persons", err);
        }
    };

    useEffect(() => {
        loadUnknowns();
        const interval = setInterval(loadUnknowns, 5000);
        return () => clearInterval(interval);
    }, []);

    const handlePromote = async (unknownId) => {
        const name = promoteName[unknownId];
        if (!name || name.trim() === '') return;

        try {
            await promoteUnknown(unknownId, name.trim());
            setPromoteName(prev => ({ ...prev, [unknownId]: '' }));
            loadUnknowns(); // Refresh list immediately
        } catch (err) {
            console.error("Promotion failed", err);
            alert("Promotion failed: " + err.message);
        }
    };

    return (
        <div className="panel">
            <div className="panel-title" style={{ color: "var(--warning-color)" }}>Unknown Identities Archive</div>
            <div className="list-container">
                {unknowns.length === 0 ? (
                    <div className="item-sub" style={{ textAlign: "center", padding: "20px 0" }}>No unpromoted unknowns.</div>
                ) : (
                    unknowns.map((u, i) => (
                        <div key={i} className="list-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                            <div className="item-main" style={{ width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                                <span className="item-name">{u.unknown_id}</span>
                                <span className="badge" style={{ background: "rgba(210, 161, 6, 0.2)", color: "var(--warning-color)" }}>Conf: {u.confidence?.toFixed(2)}</span>
                            </div>
                            <div className="item-sub">First Seen: {new Date(u.first_seen).toLocaleString()}</div>

                            <div className="input-group" style={{ width: "100%" }}>
                                <input
                                    type="text"
                                    className="text-input"
                                    placeholder="Enter Real Name..."
                                    value={promoteName[u.unknown_id] || ''}
                                    onChange={(e) => setPromoteName({ ...promoteName, [u.unknown_id]: e.target.value })}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handlePromote(u.unknown_id)}
                                >
                                    Promote
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
