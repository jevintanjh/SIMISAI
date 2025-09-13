import { useRef, useEffect } from "react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Camera, Plus, CheckCircle, Tv, Play, ArrowLeft } from "lucide-react";

interface CameraViewProps {
  language?: string;
  sessionId?: string;
}

export default function CameraView({ language = "en", sessionId = "default" }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isActive, startCamera, stopCamera } = useCamera(videoRef);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        await startCamera();
      } catch (error) {
        console.error("Failed to initialize camera:", error);
      }
    };
    
    initializeCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="relative w-full h-full">
      <div className="h-full flex flex-col">
        
        {/* Camera View - Fixed Height */}
        <div className="h-[600px] relative overflow-hidden bg-card backdrop-blur-md">
          {/* Camera Feed Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-center text-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg mb-2">Camera Ready</p>
              <p className="text-sm opacity-75">Point camera at medical device</p>
            </div>
          </div>

          {/* Back Button - Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <Button 
              size="sm"
              variant="secondary"
              className="bg-black/50 hover:bg-black/70 text-white border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Progress Indicator - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <div className="px-4 py-3 rounded-2xl shadow-lg border border-border bg-card backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-foreground">Ready</span>
              </div>
            </div>
          </div>

          {/* Component Labels - Overlay on Camera */}
          <div className="absolute inset-4 pointer-events-none">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="flex flex-col justify-start">
                <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-success mr-2" />
                  Cuff Position
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-warning mr-2" />
                  Tightness Check
                </div>
              </div>
              
              <div className="flex flex-col justify-end">
                <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                  <div className="w-2 h-2 rounded-full bg-muted mr-2" />
                  Alignment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Controls - Below Camera */}
        <div className="flex items-center justify-center space-x-4 py-4 px-4 bg-card border-t border-border">
          <Button 
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
          >
            <Camera className="w-4 h-4" />
          </Button>

          <Button 
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
