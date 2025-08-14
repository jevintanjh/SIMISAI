import { useState, useEffect, useRef, useCallback } from 'react';
import { ObjectDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

interface ThermometerDetection {
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  categories: Array<{
    categoryName: string;
    score: number;
  }>;
}

interface UseMediaPipeCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isInitialized: boolean;
  isDetecting: boolean;
  detections: ThermometerDetection[];
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  startDetection: () => void;
  stopDetection: () => void;
}

export const useMediaPipeCamera = (): UseMediaPipeCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<ObjectDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<ThermometerDetection[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe Object Detector
  const initializeDetector = useCallback(async () => {
    try {
      console.log('Initializing MediaPipe Object Detector...');
      
      const visionFilesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Using general object detection model for POC
      // TODO: Replace with custom thermometer model when available
      const detector = await ObjectDetector.createFromOptions(visionFilesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/efficientdet_lite0.tflite"
        },
        scoreThreshold: 0.3,
        runningMode: "VIDEO"
      });

      detectorRef.current = detector;
      setIsInitialized(true);
      setError(null);
      console.log('MediaPipe Object Detector initialized successfully');
    } catch (err) {
      const errorMessage = `Failed to initialize MediaPipe: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error(errorMessage);
      setError(errorMessage);
      setIsInitialized(false);
    }
  }, []);

  // Start camera with mobile-optimized settings
  const startCamera = useCallback(async () => {
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

      // Get camera with mobile-friendly constraints
      const constraints: MediaStreamConstraints = {
        video: {
          // Try back camera first (better for object detection)
          facingMode: { ideal: 'environment' },
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(playError => {
          console.warn("Auto-play blocked:", playError);
        });
      };

      console.log('Camera started successfully');
    } catch (err) {
      console.warn('Back camera failed, trying front camera:', err);
      
      // Fallback to front camera if back camera fails
      try {
        if (!videoRef.current) {
          setError("Video element not available for fallback");
          return;
        }

        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(playError => {
            console.warn("Auto-play blocked:", playError);
          });
        };

        console.log('Camera started with front camera fallback');
      } catch (fallbackErr) {
        console.error('Front camera failed, trying basic constraints:', fallbackErr);
        
        // Final fallback with basic video
        try {
          if (!videoRef.current) {
            setError("Video element not available for basic fallback");
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;

          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(playError => {
              console.warn("Auto-play blocked:", playError);
            });
          };

          console.log('Camera started with basic constraints');
        } catch (basicErr) {
          const errorMessage = `All camera access attempts failed: ${basicErr instanceof Error ? basicErr.message : 'Unknown error'}`;
          console.error(errorMessage);
          setError(errorMessage);
        }
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopDetection();
  }, []);

  // Process video frame for object detection
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !canvasRef.current || !isDetecting) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === 4 && ctx) {
      try {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Run object detection
        const nowInMs = performance.now();
        const results = await detectorRef.current.detectForVideo(video, nowInMs);

        // Filter for thermometer-like objects (for POC, look for elongated objects)
        const thermometerDetections: ThermometerDetection[] = results.detections
          .map(detection => ({
            boundingBox: {
              originX: detection.boundingBox?.originX || 0,
              originY: detection.boundingBox?.originY || 0,
              width: detection.boundingBox?.width || 0,
              height: detection.boundingBox?.height || 0
            },
            categories: detection.categories.map(cat => ({
              categoryName: cat.categoryName || 'unknown',
              score: cat.score || 0
            }))
          }))
          .filter(detection => {
            // Filter for objects that might be thermometers (elongated shape)
            const aspect_ratio = detection.boundingBox.height / detection.boundingBox.width;
            return aspect_ratio > 1.5 && detection.categories[0].score > 0.3;
          });

        setDetections(thermometerDetections);

        // Draw bounding boxes
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        thermometerDetections.forEach(detection => {
          const { originX, originY, width, height } = detection.boundingBox;
          ctx.strokeRect(originX, originY, width, height);
          
          // Draw label
          ctx.fillStyle = '#00FF00';
          ctx.font = '16px Arial';
          const label = `${detection.categories[0].categoryName}: ${(detection.categories[0].score * 100).toFixed(1)}%`;
          ctx.fillText(label, originX, originY - 10);
        });

        setError(null);
      } catch (err) {
        console.error('Detection error:', err);
        setError(`Detection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Continue processing
    if (isDetecting) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isDetecting]);

  // Start detection
  const startDetection = useCallback(() => {
    if (!isInitialized || !detectorRef.current) {
      console.warn('Detector not initialized yet');
      return;
    }
    
    setIsDetecting(true);
    processFrame();
  }, [isInitialized, processFrame]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Initialize detector on mount
  useEffect(() => {
    initializeDetector();
  }, [initializeDetector]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    isDetecting,
    detections,
    error,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection
  };
};