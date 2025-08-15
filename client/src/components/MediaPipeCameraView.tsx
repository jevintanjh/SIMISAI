import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Play, Pause, RotateCcw, Square } from "lucide-react";
import { useSimpleMediaPipe } from "@/hooks/use-simple-mediapipe";
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

export function MediaPipeCameraView({ onThermometerDetected, sessionConfig, language, sessionId }: MediaPipeCameraViewProps) {
  const {
    videoRef,
    canvasRef,
    isInitialized,
    error,
    startCamera,
    stopCamera
  } = useSimpleMediaPipe();

  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Update camera active state based on initialization
  useEffect(() => {
    if (isInitialized && !error) {
      setIsCameraActive(true);
    }
  }, [isInitialized, error]);

  // Mock detection functions for POC
  const startDetection = () => {
    setIsDetecting(true);
    // Simulate detection after 3 seconds for demo
    setTimeout(() => {
      const mockDetection = {
        boundingBox: { originX: 100, originY: 100, width: 200, height: 300 },
        categories: [{ categoryName: 'thermometer-like object', score: 0.8 }]
      };
      setDetections([mockDetection]);
      if (onThermometerDetected) onThermometerDetected(mockDetection);
    }, 3000);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setDetections([]);
  };

  // Handle camera toggle
  const handleCameraToggle = async () => {
    if (isCameraActive) {
      stopCamera();
      setIsCameraActive(false);
    } else {
      try {
        await startCamera();
        setIsCameraActive(true);
      } catch (error) {
        console.error("Failed to start camera:", error);
        setIsCameraActive(false);
      }
    }
  };

  // Handle detection toggle
  const handleDetectionToggle = () => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  // Notify parent component when thermometer is detected
  useEffect(() => {
    if (detections.length > 0 && onThermometerDetected) {
      const bestDetection = detections.reduce((best: any, current: any) => 
        current.categories[0].score > best.categories[0].score ? current : best
      );
      onThermometerDetected(bestDetection);
    }
  }, [detections, onThermometerDetected]);

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
          
          {/* Status Indicators - Top Right with increased padding */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            {isDetecting ? (
              <div className="text-xs text-white bg-black/50 px-4 py-2 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Detecting</span>
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
              <span>{detections.length} thermometer{detections.length !== 1 ? 's' : ''} detected</span>
            </div>
          )}
          
          {/* Center crosshair for alignment */}
          {isCameraActive && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Square className="w-8 h-8 text-primary opacity-50" />
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg text-sm shadow-lg bg-destructive/20 text-destructive-foreground border border-destructive/40 backdrop-blur-sm">
              {error}
            </div>
          )}
          
          {/* No camera message */}
          {!isCameraActive && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-muted-foreground opacity-50"></div>
                </div>
                <p className="text-lg mb-2">Camera Off</p>
                <p className="text-sm opacity-75">Click "Start Camera" to begin detection</p>
              </div>
            </div>
          )}
          
          {/* Camera Controls Overlay - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-10">
            {/* Camera Start/Stop Button */}
            <Button
              onClick={handleCameraToggle}
              variant="ghost"
              size="icon"
              className={`rounded-full shadow-lg w-12 h-12 ${
                isCameraActive 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black/50 hover:bg-black/70 text-white'
              }`}
            >
              <Icon 
                icon={isCameraActive ? "mingcute:camera-2-off-line" : "mingcute:camera-2-line"} 
                className="w-5 h-5" 
              />
            </Button>
            
            {/* Detection Start/Stop Button - Only show when camera is active */}
            {isCameraActive && (
              <Button
                onClick={handleDetectionToggle}
                variant="ghost"
                size="icon"
                className={`rounded-full shadow-lg w-12 h-12 ${
                  isDetecting 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                <Icon 
                  icon={isDetecting ? "mingcute:stop-line" : "mingcute:play-line"} 
                  className="w-5 h-5" 
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}