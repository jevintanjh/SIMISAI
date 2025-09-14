import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleMediaPipe } from '@/hooks/use-simple-mediapipe';
import { Icon } from "@iconify/react";

interface MediaPipeCameraViewProps {
  onThermometerDetected?: (detection: any) => void;
  sessionConfig?: {
    language: string;
    device: string;
    guidanceStyle: string;
    voiceOption: string;
  };
  language?: string;
  sessionId?: string;
}

interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  class_id: number;
}

interface CVResponse {
  detections: DetectionResult[];
  processing_time: number;
  image_size: [number, number];
}

export function MediaPipeCameraView({ onThermometerDetected, sessionConfig, language, sessionId }: MediaPipeCameraViewProps) {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    error,
    startCamera,
    stopCamera
  } = useSimpleMediaPipe();

  // Separate overlay canvas for drawing bounding boxes
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [imageSize, setImageSize] = useState<[number, number]>([640, 480]);
  const lastRunRef = useRef<number>(0);
  const DETECTION_INTERVAL = 500; // ms - 2 seconds to reduce server load while keeping video smooth

  // Color mapping for different classes
  const getClassColor = (className: string): string => {
    const colors: Record<string, string> = {
      'thermometer (Lo error)': '#EF4444',        // Red
      'thermometer (measuring)': '#3B82F6',       // Blue
      'thermometer (no display found)': '#F59E0B', // Amber
      'thermometer (off)': '#6B7280',             // Gray
      'thermometer button': '#10B981',            // Green
      'thermometer in ear': '#8B5CF6',            // Purple
      'thermometer in mouth': '#EC4899',          // Pink
      'thermometer in nose': '#6366F1',           // Indigo
      'thermometer on face': '#F97316',           // Orange
    };
    return colors[className] || '#8B5CF6'; // Default purple
  };

  // Initialize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (canvas && overlayCanvas) {
      const fixedWidth = 640;
      const fixedHeight = 480;
      
      canvas.width = fixedWidth;
      canvas.height = fixedHeight;
      overlayCanvas.width = fixedWidth;
      overlayCanvas.height = fixedHeight;
    }
  }, []);

  // Update camera active state based on initialization and auto-start detection
  useEffect(() => {
    if (isInitialized && !error) {
      setIsCameraActive(true);
      // Auto-start detection after camera is ready
      setTimeout(() => {
        setIsDetecting(true);
      }, 1000);
    }
  }, [isInitialized, error]);

  // Separate video rendering loop (runs at 60fps for smooth video)
  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

    const renderFrame = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas and draw current video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    };

    // Run at 60fps for smooth video
    const renderInterval = setInterval(renderFrame, 1000 / 60);
    return () => clearInterval(renderInterval);
  }, [isCameraActive]);

  // Separate detection loop (runs at lower frequency)
  useEffect(() => {
    if (!isDetecting || !isCameraActive || !videoRef.current) return;

    const detectFrame = async () => {
      const now = Date.now();
      if (now - lastRunRef.current < DETECTION_INTERVAL) return;
      lastRunRef.current = now;

      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (!canvas || !video) {
          setIsProcessing(false);
          return;
        }

        // Create a temporary canvas for detection (don't interfere with video rendering)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) {
          setIsProcessing(false);
          return;
        }

        // Draw current video frame to temporary canvas
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Get image data as base64
        const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
        const base64Data = imageData.split(',')[1];

        // Call CV API
        const response = await fetch('/api/cv/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: base64Data,
            sessionId: sessionId || 'default-session'
          }),
        });

        if (response.ok) {
          const result: CVResponse = await response.json();
          
          if (result.detections && result.detections.length > 0) {
            setDetections(result.detections);
            
            // Call the callback with detection results
            if (onThermometerDetected) {
              onThermometerDetected(result.detections);
            }

            // Draw bounding boxes (this will persist until next detection)
            drawBoundingBoxes(result.detections);
          } else {
            setDetections([]);
            clearBoundingBoxes();
          }
        } else {
          console.error('CV API error:', response.statusText);
        }
      } catch (error) {
        console.error('Detection error:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    const interval = setInterval(detectFrame, DETECTION_INTERVAL);
    return () => clearInterval(interval);
  }, [isDetecting, isCameraActive, onThermometerDetected, sessionId]);

  // Draw bounding boxes on overlay canvas
  const drawBoundingBoxes = useCallback((detections: DetectionResult[]) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;
      const color = getClassColor(detection.class);
      
      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      const label = `${detection.class} (${(detection.confidence * 100).toFixed(1)}%)`;
      const labelWidth = ctx.measureText(label).width + 10;
      const labelHeight = 20;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
      
      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(label, x + 5, y - 5);
    });
  }, []);

  // Clear bounding boxes
  const clearBoundingBoxes = useCallback(() => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;

    const ctx = overlayCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
  }, []);

  const handleCameraToggle = useCallback(() => {
    if (isCameraActive) {
      stopCamera();
      setIsCameraActive(false);
      setIsDetecting(false);
      setDetections([]);
      clearBoundingBoxes();
    } else {
      startCamera();
      setIsCameraActive(true);
      // Auto-start detection after camera starts
      setTimeout(() => {
        setIsDetecting(true);
      }, 1000);
    }
  }, [isCameraActive, startCamera, stopCamera, clearBoundingBoxes]);

  const handleDetectionToggle = useCallback(() => {
    setIsDetecting(!isDetecting);
    if (!isDetecting) {
      setDetections([]);
      clearBoundingBoxes();
    }
  }, [isDetecting, clearBoundingBoxes]);

  const handleReset = useCallback(() => {
    setDetections([]);
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  }, []);

  return (
    <div className="w-full h-full">
      <div className="h-full flex flex-col">
        
        {/* Camera View with Overlay Controls - Full Width/Height */}
        <div className="flex-1 relative overflow-hidden bg-card backdrop-blur-md">
          {/* Video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Canvas for drawing detection results */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay canvas for bounding boxes */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          
          {/* Status Indicators - Top Right with increased padding */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            {isDetecting ? (
              <div className="text-xs text-white bg-black/50 px-4 py-2 rounded-full flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
                <span>{isProcessing ? 'Processing...' : 'Detecting'}</span>
              </div>
            ) : (
              <div className="text-xs text-white bg-black/50 px-4 py-2 rounded-full flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-destructive'}`} />
                <span>{isInitialized ? 'Ready' : 'Initializing...'}</span>
              </div>
            )}
          </div>
          
          {/* Detection Results - Center Above Camera Controls */}
          {detections.length > 0 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm flex items-center space-x-2 z-10">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span>{detections.length} detection{detections.length !== 1 ? 's' : ''} found</span>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-foreground max-w-sm mx-auto px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                  <Icon icon="mingcute:alert-fill" className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-sm opacity-75 leading-relaxed mb-4">
                  {error}
                </p>
              </div>
            </div>
          )}
          
          {/* No camera message - only show when no error and camera is off */}
          {!isCameraActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon icon="mingcute:camera-2-off-line" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Camera Off</h3>
                <div className="flex items-center justify-center space-x-2 text-sm opacity-75">
                  <Icon icon="mingcute:camera-2-line" className="w-4 h-4 text-primary" />
                  <span>Click the camera button to enable the camera</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Camera Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-10">
            {/* Camera Start/Stop Button */}
            <Button
              onClick={handleCameraToggle}
              variant="ghost"
              size="icon"
              className={`rounded-full shadow-lg w-12 h-12 transition-opacity duration-200 ${
                isCameraActive 
                  ? 'bg-white text-black opacity-60 hover:opacity-100' 
                  : 'bg-black/50 text-white opacity-60 hover:opacity-100'
              }`}
            >
              <Icon icon={isCameraActive ? "mingcute:camera-2-off-line" : "mingcute:camera-2-line"} className="w-5 h-5" />
            </Button>

            {/* Detection Start/Stop Button */}
            {isCameraActive && (
              <Button
                  onClick={handleDetectionToggle}

                className={`rounded-full shadow-lg w-12 h-12 transition-opacity duration-200 ${
                  isDetecting 
                    ? 'bg-white text-black opacity-60 hover:opacity-100' 
                    : 'bg-black/50 text-white opacity-60 hover:opacity-100'
                }`}
              >
                <Icon icon={isDetecting ? "mingcute:stop-line" : "mingcute:play-line"} className="w-5 h-5" />
              </Button>
            )}

            {/* Reset Button - Only show when there are detections */}
            {detections.length > 0 && (
              <Button
                onClick={handleReset}
                variant="ghost"
                size="icon"
                className="rounded-full shadow-lg w-12 h-12 bg-black/50 text-white opacity-60 hover:opacity-100"
              >
                <Icon icon="mingcute:refresh-anticlockwise-1-fill" className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}