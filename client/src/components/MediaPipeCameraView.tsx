import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleMediaPipe } from '@/hooks/use-simple-mediapipe';

interface MediaPipeCameraViewProps {
  onThermometerDetected?: (detection: any) => void;
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

export function MediaPipeCameraView({ onThermometerDetected }: MediaPipeCameraViewProps) {
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
  const DETECTION_INTERVAL = 1000; // ms - 1 second for better responsiveness

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
      // Auto-start detection when camera is ready
      setIsDetecting(true);
    }
  }, [isInitialized, error]);

  const drawDetections = useCallback((dets: DetectionResult[], imageSize?: [number, number]) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    // Clear the overlay canvas
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Only draw if we have detections
    if (dets.length === 0) return;

    console.log('Drawing detections:', dets.length, 'boxes');

    // Fixed canvas dimensions
    const fixedWidth = 640;
    const fixedHeight = 480;

    // Draw bounding boxes and labels
    for (const det of dets) {
      const [x, y, w, h] = det.bbox;
      console.log('Drawing box:', det.class, 'at', x, y, w, h);
      
      // Scale bounding box coordinates to fixed canvas size
      const originalWidth = imageSize?.[0] || 640;
      const originalHeight = imageSize?.[1] || 480;
      const scaleX = fixedWidth / originalWidth;
      const scaleY = fixedHeight / originalHeight;
      
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;
      
      // Get color for this class
      const color = getClassColor(det.class);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

      // Label background
      const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 14px sans-serif';
      const metrics = ctx.measureText(label);
      const labelW = metrics.width + 12;
      const labelH = 20;
      ctx.fillStyle = color + 'DD'; // Add transparency
      ctx.fillRect(scaledX, Math.max(0, scaledY - labelH), labelW, labelH);

      // Label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, scaledX + 6, Math.max(16, scaledY - 6));
    }
  }, []);

  // Capture current frame and call CV API
  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;
    if (isProcessing) return;

    const now = Date.now();
    if (now - lastRunRef.current < DETECTION_INTERVAL) return;
    lastRunRef.current = now;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed canvas dimensions only once to prevent size changes
    const fixedWidth = 640;
    const fixedHeight = 480;
    
    // Only set dimensions if they haven't been set yet
    if (canvas.width !== fixedWidth || canvas.height !== fixedHeight) {
      canvas.width = fixedWidth;
      canvas.height = fixedHeight;
    }
    
    if (overlayCanvas.width !== fixedWidth || overlayCanvas.height !== fixedHeight) {
      overlayCanvas.width = fixedWidth;
      overlayCanvas.height = fixedHeight;
    }

    // Draw current frame to the main canvas (scaled to fit)
    ctx.drawImage(video, 0, 0, fixedWidth, fixedHeight);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    setIsProcessing(true);
    try {
      const res = await fetch('/api/cv/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      });
      if (!res.ok) {
        // Keep previous boxes on failure
        return;
      }
      const result: CVResponse = await res.json();
      console.log('Detection results:', result.detections);
      setDetections(result.detections || []);
      
      // Store image size for scaling
      if (result.image_size) {
        setImageSize(result.image_size);
      }

      // Notify parent with best detection
      if (result.detections && result.detections.length > 0 && onThermometerDetected) {
        const best = result.detections.reduce((a, b) => (a.confidence > b.confidence ? a : b));
        onThermometerDetected(best);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [DETECTION_INTERVAL, drawDetections, isProcessing, onThermometerDetected, videoRef, canvasRef]);

  // Detection loop control
  useEffect(() => {
    if (!isDetecting) return;
    
    console.log('Starting detection loop');
    
    // Run once immediately
    captureAndDetect();
    const id = setInterval(() => {
      console.log('Detection interval triggered');
      captureAndDetect();
    }, DETECTION_INTERVAL);
    
    return () => {
      console.log('Clearing detection interval');
      clearInterval(id);
    };
  }, [isDetecting, captureAndDetect, DETECTION_INTERVAL]);

  // Redraw detections when they change
  useEffect(() => {
    if (detections.length > 0) {
      console.log('Detections changed, redrawing:', detections.length);
      drawDetections(detections, imageSize);
    }
  }, [detections, drawDetections, imageSize]);

  // Handle camera toggle
  const handleCameraToggle = async () => {
    if (isCameraActive) {
      stopCamera();
      setIsCameraActive(false);
      setIsDetecting(false);
      setDetections([]);
      // Clear both canvases
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      if (overlayCanvasRef.current) {
        const ctx = overlayCanvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    } else {
      try {
        await startCamera();
        setIsCameraActive(true);
        // Auto-start detection when camera starts
        setIsDetecting(true);
      } catch (e) {
        console.error('Failed to start camera:', e);
        setIsCameraActive(false);
      }
    }
  };

  // Handle detection toggle
  const handleDetectionToggle = () => {
    setIsDetecting((prev) => !prev);
  };

  // Reset button clears detections and overlay
  const handleReset = () => {
    setDetections([]);
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Card className="h-full shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-4 h-full">
          <div className="flex flex-col h-full space-y-4" style={{ minHeight: '600px' }}>
            {/* Header with status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#8B5CF6]" />
                <span className="font-medium text-white">Thermometer Detection (YOLOv8)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                <span className="text-sm text-[#E2E8F0]">
                  {isInitialized ? 'Ready' : 'Initializing...'}
                </span>
                {isDetecting && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                    <span className="text-sm text-[#8B5CF6]">Detecting</span>
                  </>
                )}
              </div>
            </div>

            {/* Camera View */}
            <div className="relative bg-black rounded-lg overflow-hidden flex-shrink-0" style={{ height: '400px', width: '100%' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />

              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none">
                {detections.length > 0 && (
                  <div className="absolute top-4 left-4 bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-sm shadow-lg">
                    {detections.length} detection{detections.length !== 1 ? 's' : ''}
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-4 left-4 right-4 bg-[#EF4444] text-white p-3 rounded-lg text-sm shadow-lg">
                    {error}
                  </div>
                )}

                {!isCameraActive && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Camera Off</p>
                      <p className="text-sm opacity-75">Click "Start Camera" to begin detection</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleCameraToggle}
                variant={isCameraActive ? 'destructive' : 'default'}
                disabled={!isInitialized}
                className={`flex items-center space-x-2 ${
                  isCameraActive 
                    ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white' 
                    : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
                } shadow-lg`}
              >
                <Camera className="w-4 h-4" />
                <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
              </Button>

              {isCameraActive && (
                <Button
                  onClick={handleDetectionToggle}
                  variant={isDetecting ? 'secondary' : 'default'}
                  disabled={!isCameraActive}
                  className={`flex items-center space-x-2 ${
                    isDetecting 
                      ? 'bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] border border-[rgba(139,92,246,0.3)]' 
                      : 'bg-[#A78BFA] hover:bg-[#8B5CF6] text-white'
                  } shadow-lg`}
                >
                  {isDetecting ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Detection</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Detection</span>
                    </>
                  )}
                </Button>
              )}

              {detections.length > 0 && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 border-[rgba(139,92,246,0.3)] text-[#A78BFA] hover:bg-[rgba(139,92,246,0.1)] shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              )}
            </div>

            {/* Detection Info */}
            {detections.length > 0 && (
              <div className="bg-[rgba(139,92,246,0.1)] rounded-lg p-4 border border-[rgba(139,92,246,0.3)]" style={{ backdropFilter: 'blur(10px)' }}>
                <h4 className="font-medium text-white mb-2">Detection Results:</h4>
                <div className="space-y-2">
                  {detections.map((detection: DetectionResult, index: number) => (
                    <div key={index} className="flex justify-between text-sm items-center">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getClassColor(detection.class) }}
                        />
                        <span className="text-[#E2E8F0]">
                          {detection.class}
                        </span>
                      </div>
                      <span className="text-[#A78BFA] font-medium">
                        {(detection.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}