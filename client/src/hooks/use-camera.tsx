import { useCallback, useRef, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Fallback to front camera if back camera fails
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsActive(true);
        }
      } catch (fallbackError) {
        console.error("Error accessing front camera:", fallbackError);
      }
    }
  }, [videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [videoRef]);

  return { isActive, startCamera, stopCamera };
}
