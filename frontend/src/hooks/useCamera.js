import { useState, useRef, useCallback } from 'react';

/**
 * useCamera
 * Manages the browser webcam stream lifecycle.
 *
 * Returns:
 *   videoRef     – attach to <video> element
 *   cameraOn     – boolean: is camera active?
 *   error        – string | null: permission error message
 *   startCamera  – async function to start stream
 *   stopCamera   – function to stop stream
 */
export default function useCamera() {
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error,    setError]    = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      return true;
    } catch (err) {
      setError('Camera access denied. Please allow camera permission in your browser.');
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setError(null);
  }, []);

  return { videoRef, cameraOn, error, startCamera, stopCamera };
}
