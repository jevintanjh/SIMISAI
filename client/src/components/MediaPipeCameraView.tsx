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

  const [isDetecting, setIsDetecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const lastRunRef = useRef<number>(0);
  const DETECTION_INTERVAL = 2000; // ms

  // Update camera active state based on initialization
  useEffect(() => {
    if (isInitialized && !error) {
      setIsCameraActive(true);
    }
  }, [isInitialized, error]);

  const drawDetections = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dets: DetectionResult[]) => {
    ctx.clearRect(0, 0, width, height);

    // Slightly transparent dark overlay to make boxes readable
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);

    for (const det of dets) {
      const [x, y, w, h] = det.bbox;
      // Pick a color per class (simple hash)
      const color = '#8B5CF6';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Label background
      const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = '12px sans-serif';
      const metrics = ctx.measureText(label);
      const labelW = metrics.width + 8;
      const labelH = 18;
      ctx.fillStyle = 'rgba(139,92,246,0.9)';
      ctx.fillRect(x, Math.max(0, y - labelH), labelW, labelH);

      // Label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 4, Math.max(12, y - 6));
    }
  }, []);

  // Capture current frame and call CV API
  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (isProcessing) return;

    const now = Date.now();
    if (now - lastRunRef.current < DETECTION_INTERVAL) return;
    lastRunRef.current = now;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to the video feed
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
      setDetections(result.detections || []);

      // Draw immediately
      drawDetections(ctx, canvas.width, canvas.height, result.detections || []);

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
    // Run once immediately
    captureAndDetect();
    const id = setInterval(captureAndDetect, DETECTION_INTERVAL);
    return () => clearInterval(id);
  }, [isDetecting, captureAndDetect, DETECTION_INTERVAL]);

  // Handle camera toggle
  const handleCameraToggle = async () => {
    if (isCameraActive) {
      stopCamera();
      setIsCameraActive(false);
      setIsDetecting(false);
      setDetections([]);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    } else {
      try {
        await startCamera();
        setIsCameraActive(true);
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
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Card className="h-full shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-4 h-full">
          <div className="flex flex-col h-full space-y-4">
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
            <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
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

                {/* {isCameraActive && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Square className="w-8 h-8 text-[#8B5CF6] opacity-50" />
                  </div>
                )} */}
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
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-[#E2E8F0]">
                        Object {index + 1}: {detection.class}
                      </span>
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