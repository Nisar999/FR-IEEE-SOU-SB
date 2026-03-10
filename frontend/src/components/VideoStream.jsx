import React, { useEffect, useRef, useState } from 'react';
import { WEBRTC_OFFER_URL } from '../services/api';

export default function VideoStream({ cameraId = "cam1" }) {
    const videoRef = useRef(null);
    const pcRef = useRef(null);
    const [status, setStatus] = useState("connecting"); // connecting, connected, error

    useEffect(() => {
        let active = true;

        async function startWebRTC() {
            try {
                const pc = new RTCPeerConnection();
                pcRef.current = pc;

                pc.addTransceiver('video', { direction: 'recvonly' });

                pc.addEventListener('track', (evt) => {
                    if (videoRef.current && evt.track.kind === 'video') {
                        videoRef.current.srcObject = new MediaStream([evt.track]);
                        setStatus("connected");
                    }
                });

                pc.addEventListener('connectionstatechange', () => {
                    console.log(`WebRTC state: ${pc.connectionState}`);
                    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                        setStatus("error");
                    }
                });

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // Fetch SDP answer from backend
                const response = await fetch(WEBRTC_OFFER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sdp: pc.localDescription.sdp,
                        type: pc.localDescription.type,
                        camera_id: cameraId
                    })
                });

                if (!active) return;

                const answer = await response.json();
                await pc.setRemoteDescription(answer);

            } catch (err) {
                console.error("WebRTC Error:", err);
                if (active) setStatus("error");
            }
        }

        startWebRTC();

        return () => {
            active = false;
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, [cameraId]);

    return (
        <div className="panel" style={{ gridRow: "span 2" }}>
            <div className="panel-title">
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: status === "connected" ? "var(--success-color)" : (status === "error" ? "var(--danger-color)" : "var(--warning-color)") }}></span>
                Live Recognition Stream
            </div>
            <div className="video-container">
                {status !== "connected" && (
                    <div className="loading-overlay">
                        {status === "connecting" ? (
                            <>
                                <div className="spinner"></div>
                                <span>Connecting to Camera...</span>
                            </>
                        ) : (
                            <span style={{ color: "var(--danger-color)" }}>Connection Lost / Error</span>
                        )}
                    </div>
                )}
                <video ref={videoRef} autoPlay playsInline muted />
            </div>
        </div>
    );
}
