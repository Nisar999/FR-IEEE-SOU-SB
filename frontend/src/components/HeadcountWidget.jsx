import React, { useEffect, useState } from 'react';
import { fetchLiveHeadcount } from '../services/api';
import { Users, UserX, UserSearch } from 'lucide-react';

export default function HeadcountWidget() {
    const [data, setData] = useState({ known_persons: 0, unknown_persons: 0, total_persons: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchLiveHeadcount();
                setData(res.data);
            } catch (err) {
                console.error("Headcount fetch error", err);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000); // Poll every second for real-time feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="panel">
            <div className="panel-title">Real-Time Headcount</div>
            <div className="headcount-grid">
                <div className="stat-card">
                    <Users size={24} color="var(--accent-color)" />
                    <div className="stat-value total">{data.total_persons}</div>
                    <div className="item-sub">Total Active</div>
                </div>
                <div className="stat-card">
                    <UserSearch size={24} color="var(--success-color)" />
                    <div className="stat-value known">{data.known_persons}</div>
                    <div className="item-sub">Known</div>
                </div>
                <div className="stat-card">
                    <UserX size={24} color="var(--warning-color)" />
                    <div className="stat-value unknown">{data.unknown_persons}</div>
                    <div className="item-sub">Unknown</div>
                </div>
            </div>
        </div>
    );
}
