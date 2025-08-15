import { useRef, useEffect } from "react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Camera, Plus, CheckCircle, Tv, Play } from "lucide-react";
import InstructionCard from "@/components/InstructionCard";

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
        
        {/* Camera View with Overlay Controls - Full Width/Height */}
        <div className="relative overflow-hidden camera-overlay mb-4 flex-1 min-h-[600px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Mock Detection Overlay - in production this would be replaced with actual CV detection */}
          <div className="absolute inset-4">
            {/* Detection Bounding Box */}
            <div className="detection-box absolute top-8 left-4 right-4 bottom-16 bg-transparent"></div>
            
            {/* Detection Status */}
            <div className="absolute top-4 left-4 component-label">
              <div className="px-3 py-2 rounded-lg text-sm font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Blood Pressure Monitor Detected
              </div>
            </div>

            {/* Component Labels */}
            <div className="absolute top-20 right-8 component-label">
              <div className="px-3 py-1 rounded-md text-xs font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                <Tv className="w-3 h-3 mr-1" />
                Display
              </div>
            </div>

            <div className="absolute bottom-24 left-8 component-label">
              <div className="px-3 py-1 rounded-md text-xs font-medium flex items-center border border-border bg-secondary text-foreground backdrop-blur-sm">
                <Play className="w-3 h-3 mr-1" />
                Start Button
              </div>
            </div>
          </div>

          {/* Camera Controls Overlay - Bottom Center */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-10">
            {/* Camera Button */}
            <Button 
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg w-12 h-12"
            >
              <Camera className="w-5 h-5" />
            </Button>

            {/* Zoom Control */}
            <Button 
              size="icon"
              className="bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg w-12 h-12"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Instructions - Outside the box, after the camera */}
        <div className="text-left px-4 pt-4">
          <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Scan!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Point your camera at your medical device to get instant, step-by-step guidance.
          </p>
        </div>

        {/* Instruction Card - Below Instructions */}
        <div className="px-4 pb-4">
          <InstructionCard 
            language={language}
            sessionId={sessionId}
          />
        </div>
      </div>
    </div>
  );
}
