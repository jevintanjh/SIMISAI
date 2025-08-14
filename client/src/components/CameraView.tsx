import { useRef, useEffect, useState } from "react";
import { useCamera } from "@/hooks/use-camera";
import { Button } from "@/components/ui/button";
import { Camera, Plus, CheckCircle, Tv, Play } from "lucide-react";

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isActive, startCamera, stopCamera } = useCamera(videoRef);
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 5;

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

  const progressSteps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="relative">
      {/* Camera View */}
      <div className="relative h-96 bg-gray-900 overflow-hidden camera-overlay">
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
            <div className="detection-green px-3 py-2 rounded-lg text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Blood Pressure Monitor Detected
            </div>
          </div>

          {/* Component Labels */}
          <div className="absolute top-20 right-8 component-label">
            <div className="medical-blue bg-opacity-90 px-3 py-1 rounded-md text-xs font-medium flex items-center">
              <Tv className="w-3 h-3 mr-1" />
              Display
            </div>
          </div>

          <div className="absolute bottom-24 left-8 component-label">
            <div className="interactive-orange bg-opacity-90 px-3 py-1 rounded-md text-xs font-medium flex items-center">
              <Play className="w-3 h-3 mr-1" />
              Start Button
            </div>
          </div>
        </div>

        {/* Camera Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-3">
          <Button 
            size="icon"
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
          >
            <Camera className="w-5 h-5" />
          </Button>
        </div>

        {/* Zoom Control */}
        <div className="absolute top-4 right-4">
          <Button 
            size="icon"
            className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="medical-blue text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="flex space-x-1">
            {progressSteps.map((step) => (
              <div
                key={step}
                className={`w-12 h-1 rounded-full transition-all ${
                  step <= currentStep 
                    ? "bg-white" 
                    : "bg-white bg-opacity-30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
