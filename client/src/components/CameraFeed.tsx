import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Volume2, VolumeX } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { useComputerVision } from '@/hooks/useComputerVision';
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
      stopAnalysis();
    } else {
      startCamera();
    }
  };

  return (
    <Card className="bg-purple-900/30 border-purple-700/50 overflow-hidden">
      <div className="relative aspect-video bg-black">
        {/* Video Feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600/80 rounded-full">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">REC 00:08:41</span>
          </div>
        )}

        {/* Device Detection Overlay */}
        {lastDetection?.deviceDetected && lastDetection.boundingBox && (
          <div
            className="absolute border-2 border-green-400"
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
          <div className="absolute inset-0 flex items-center justify-center bg-purple-900/80">
            <div className="text-center text-white p-4">
              <CameraOff className="w-12 h-12 mx-auto mb-2 text-purple-300" />
              <p className="text-sm">Camera access denied</p>
              <Button
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="mt-2 border-purple-400 text-purple-100 hover:bg-purple-700/50"
              >
                Try Again
              </Button>
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
  );
};
