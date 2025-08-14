import { useEffect, useState } from 'react';
import { Camera, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleMediaPipe } from '@/hooks/use-simple-mediapipe';

interface MediaPipeCameraViewProps {
  onThermometerDetected?: (detection: any) => void;
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
    <div className="w-full h-full relative">
      <Card className="h-full shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-4 h-full">
          <div className="flex flex-col h-full space-y-4">
            
            {/* Header with status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#8B5CF6]" />
                <span className="font-medium text-white">MediaPipe Thermometer Detection</span>
              </div>
              
              {/* Status indicators */}
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
              {/* Video element (visible for better UX) */}
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
              
              {/* Overlay UI */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Detection count */}
                {detections.length > 0 && (
                  <div className="absolute top-4 left-4 bg-[#8B5CF6] text-white px-3 py-1 rounded-full text-sm shadow-lg">
                    {detections.length} thermometer{detections.length !== 1 ? 's' : ''} detected
                  </div>
                )}
                
                {/* Center crosshair for alignment */}
                {isCameraActive && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Square className="w-8 h-8 text-[#8B5CF6] opacity-50" />
                  </div>
                )}
                
                {/* Error message */}
                {error && (
                  <div className="absolute bottom-4 left-4 right-4 bg-[#EF4444] text-white p-3 rounded-lg text-sm shadow-lg">
                    {error}
                  </div>
                )}
                
                {/* No camera message */}
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
                variant={isCameraActive ? "destructive" : "default"}
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
                  variant={isDetecting ? "secondary" : "default"}
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
                  onClick={() => window.location.reload()}
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
                  {detections.map((detection: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-[#E2E8F0]">
                        Object {index + 1}: {detection.categories[0].categoryName}
                      </span>
                      <span className="text-[#A78BFA] font-medium">
                        {(detection.categories[0].score * 100).toFixed(1)}% confidence
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