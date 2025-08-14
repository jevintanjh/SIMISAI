import { useCallback, useRef, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>) {
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) {
        console.warn("Video element not available");
        return;
      }

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
      console.log("Camera started successfully with back camera");
    } catch (error) {
      console.error("Error accessing back camera:", error);
      // Fallback to front camera if back camera fails
      try {
        if (!videoRef.current) {
          console.warn("Video element not available for fallback");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        console.log("Camera started successfully with front camera");
      } catch (fallbackError) {
        console.error("Error accessing front camera:", fallbackError);
        // Try basic video constraints as final fallback
        try {
          if (!videoRef.current) {
            console.warn("Video element not available for basic fallback");
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });

          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsActive(true);
          console.log("Camera started successfully with basic constraints");
        } catch (basicError) {
          console.error("All camera access attempts failed:", basicError);
        }
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
