import React, { useEffect, useRef, useState } from 'react';
import { WEBRTC_OFFER_URL } from '@/services/api';

interface VideoStreamProps {
    cameraId: string;
    cameraName?: string;
}

export default function VideoStream({ cameraId, cameraName }: VideoStreamProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");

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

                if (!pc.localDescription) {
                    throw new Error("Failed to set local description");
                }

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
        <div className="relative w-full h-full flex items-center justify-center">
            {status !== "connected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition-opacity">
                    {status === "connecting" ? (
                        <>
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                            <span className="text-sm font-medium text-white/90">Connecting to Stream...</span>
                        </>
                    ) : (
                        <span className="text-sm font-medium text-destructive">Connection Lost / Error</span>
                    )}
                </div>
            )}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            {/* Status indicator injected dynamically */}
            <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-black/40 backdrop-blur px-2 py-1 rounded">
                <span className={`w-2 h-2 rounded-full ${status === "connected" ? "bg-green-500" : (status === "error" ? "bg-red-500" : "bg-amber-500 animate-pulse")}`}></span>
                <span className="text-xs text-white/90 font-medium tracking-wide">
                    {status === "connected" ? "LIVE" : status.toUpperCase()}
                </span>
            </div>
        </div>
    );
}
