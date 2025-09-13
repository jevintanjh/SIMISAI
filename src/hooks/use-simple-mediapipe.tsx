import { useState, useEffect, useRef } from 'react';

interface UseSimpleMediaPipeReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isInitialized: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export const useSimpleMediaPipe = (): UseSimpleMediaPipeReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple camera start without MediaPipe for now
  const startCamera = async () => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (!videoRef.current) {
        setError("Video element not available");
        return;
      }

      // Try back camera first
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playError => {
            console.warn("Auto-play blocked:", playError);
          });
          setIsInitialized(true);
        };

        console.log('Camera started successfully with back camera');
      } catch (backCameraError) {
        console.warn('Back camera failed, trying front camera:', backCameraError);
        
        // Fallback to front camera
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playError => {
            console.warn("Auto-play blocked:", playError);
          });
          setIsInitialized(true);
        };

        console.log('Camera started successfully with front camera');
      }
    } catch (err) {
      const errorMessage = `Camera failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(errorMessage);
      setError(errorMessage);
      setIsInitialized(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsInitialized(false);
  };

  // Initialize camera on mount for better UX
  useEffect(() => {
    const autoStart = async () => {
      try {
        await startCamera();
      } catch (error) {
        console.warn("Auto-start camera failed:", error);
      }
    };
    
    // Auto-start camera after a short delay
    const timer = setTimeout(autoStart, 500);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    error,
    startCamera,
    stopCamera
  };
};