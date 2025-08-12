import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useComputerVision } from '@/hooks/useComputerVision';
import { TroubleshootingModal } from './TroubleshootingModal';
import { DeviceType } from '@shared/schema';

interface CameraFeedProps {
  deviceType: DeviceType;
  onDetection?: (detection: any) => void;
  isRecording?: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ 
  deviceType, 
  onDetection,
  isRecording = false 
}) => {
  const { videoRef, isStreaming, hasPermission, error, startCamera, stopCamera } = useCamera();
  const { isAnalyzing, lastDetection, startAnalysis, stopAnalysis } = useComputerVision(deviceType);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    if (isStreaming && !isAnalyzing) {
      startAnalysis(2000);
    }
    
    return () => {
      if (isAnalyzing) {
        stopAnalysis();
      }
    };
  }, [isStreaming, isAnalyzing, startAnalysis, stopAnalysis]);

  useEffect(() => {
    if (lastDetection && onDetection) {
      onDetection(lastDetection);
    }
  }, [lastDetection, onDetection]);

  const handleToggleCamera = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <>
      <Card className="overflow-hidden bg-slate-800/50 border-slate-700">
        {/* Camera Feed */}
        <div className="aspect-video bg-slate-900 relative">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC
            </div>
          )}

          {/* Device Detection Overlay */}
          {lastDetection && lastDetection.deviceDetected && lastDetection.boundingBox && (
            <div 
              className="absolute border-2 border-green-400 pointer-events-none"
              style={{
                left: `${lastDetection.boundingBox.x}px`,
                top: `${lastDetection.boundingBox.y}px`,
                width: `${lastDetection.boundingBox.width}px`,
                height: `${lastDetection.boundingBox.height}px`,
              }}
            >
              <div className="absolute -top-6 left-0 bg-green-400 text-black px-2 py-1 text-xs font-bold rounded">
                {deviceType.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleCamera}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isStreaming ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80 backdrop-blur-sm">
              <div className="text-center text-white p-6 max-w-md">
                <CameraOff className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
                <p className="text-sm mb-4 text-purple-100">{error}</p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startCamera}
                      className="border-purple-400 text-purple-100 hover:bg-purple-700/50 flex-1"
                    >
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTroubleshooting(true)}
                      className="border-purple-400 text-purple-100 hover:bg-purple-700/50"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-purple-200">
                    Click the help button for troubleshooting steps
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Camera State */}
          {!isStreaming && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-900/50">
              <div className="text-center text-white p-4">
                <Camera className="w-12 h-12 mx-auto mb-2 text-purple-300" />
                <p className="text-sm mb-2">Click to start camera</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startCamera}
                  className="border-purple-400 text-purple-100 hover:bg-purple-700/50"
                >
                  Start Camera
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="p-3 bg-purple-900/50 text-purple-100 text-sm">
          <div className="flex justify-between items-center">
            <span>
              {isAnalyzing ? 'Analyzing...' : isStreaming ? 'Camera Active' : 'Camera Off'}
            </span>
            {lastDetection && (
              <span className={`px-2 py-1 rounded text-xs ${
                lastDetection.deviceDetected ? 'bg-green-600' : 'bg-yellow-600'
              }`}>
                {lastDetection.deviceDetected 
                  ? `Device Detected (${Math.round(lastDetection.confidence * 100)}%)`
                  : 'Looking for device...'
                }
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Troubleshooting Modal */}
      <TroubleshootingModal 
        isOpen={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
        error={error}
      />
    </>
  );
};