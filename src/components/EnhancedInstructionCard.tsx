import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@iconify/react";

interface EnhancedInstructionCardProps {
  language: string;
  sessionId: string;
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  checkpoints: string[] | null;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onStepComplete: (stepNumber: number) => void;
  onStepRetry: (stepNumber: number) => void;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
}

const deviceIllustrations = {
  thermometer: {
    icon: "🌡️",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30"
  },
  "blood-pressure": {
    icon: "🩸",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30"
  },
  glucose: {
    icon: "🍬",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30"
  },
  default: {
    icon: "📱",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30"
  }
};

const stepAnimations = [
  "animate-pulse",
  "animate-bounce",
  "animate-ping",
  "animate-spin"
];

export default function EnhancedInstructionCard({
  language,
  sessionId,
  currentStep,
  totalSteps,
  title,
  description,
  checkpoints,
  onNextStep,
  onPreviousStep,
  onStepComplete,
  onStepRetry,
  deviceType = "thermometer",
  deviceBrand = "",
  deviceModel = ""
}: EnhancedInstructionCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAROverlay, setShowAROverlay] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(new Set());

  const deviceInfo = deviceIllustrations[deviceType as keyof typeof deviceIllustrations] || deviceIllustrations.default;
  const progress = (currentStep / totalSteps) * 100;

  // Random animation for visual interest
  useEffect(() => {
    const randomAnimation = stepAnimations[Math.floor(Math.random() * stepAnimations.length)];
    setAnimationClass(randomAnimation);
  }, [currentStep]);

  const handleCheckpointToggle = (index: number) => {
    const newCompleted = new Set(completedCheckpoints);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedCheckpoints(newCompleted);
  };

  const handleStepComplete = () => {
    setIsCompleted(true);
    onStepComplete(currentStep);
    
    // Reset completion state after animation
    setTimeout(() => {
      setIsCompleted(false);
    }, 2000);
  };

  const handleStepRetry = () => {
    onStepRetry(currentStep);
    setCompletedCheckpoints(new Set());
  };

  const getStepIcon = () => {
    if (isCompleted) return "mingcute:check-circle-fill";
    if (currentStep === 1) return "mingcute:play-circle-fill";
    if (currentStep === totalSteps) return "mingcute:flag-fill";
    return "mingcute:arrow-right-circle-fill";
  };

  const getStepColor = () => {
    if (isCompleted) return "text-green-400";
    if (currentStep === 1) return "text-blue-400";
    if (currentStep === totalSteps) return "text-purple-400";
    return "text-primary";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Device Info */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${deviceInfo.bgColor} ${deviceInfo.borderColor} border-2 rounded-full flex items-center justify-center`}>
              <span className="text-2xl">{deviceInfo.icon}</span>
            </div>
            <div>
              <CardTitle className="text-white text-lg">{title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs text-white/70 border-white/30">
                  {deviceBrand} {deviceModel}
                </Badge>
                <Badge variant="outline" className="text-xs text-white/70 border-white/30">
                  Step {currentStep} of {totalSteps}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* AR Overlay Toggle */}
          <Button
            onClick={() => setShowAROverlay(!showAROverlay)}
            variant="outline"
            size="sm"
            className="bg-transparent text-white border-white/30 hover:border-white/60"
          >
            <Icon icon="mingcute:ar-line" className="w-4 h-4 mr-2" />
            AR Guide
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Progress</span>
            <span className="text-sm text-white/70">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="flex-1 flex flex-col">
        {/* Description with Enhanced Styling */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg border ${deviceInfo.borderColor} ${deviceInfo.bgColor} mb-4`}>
            <p className="text-white/90 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {/* AR Overlay Instructions */}
        {showAROverlay && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon icon="mingcute:ar-line" className="w-5 h-5 text-purple-400" />
              <h4 className="text-white font-semibold">AR Guidance</h4>
            </div>
            <p className="text-white/80 text-sm">
              Point your camera at your device to see real-time positioning guidance and step-by-step overlays.
            </p>
            <div className="mt-3 flex space-x-2">
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
                <Icon icon="mingcute:camera-line" className="w-4 h-4 mr-1" />
                Start AR
              </Button>
              <Button size="sm" variant="outline" className="text-white border-white/30">
                <Icon icon="mingcute:question-line" className="w-4 h-4 mr-1" />
                Help
              </Button>
            </div>
          </div>
        )}

        {/* Checkpoints */}
        {checkpoints && checkpoints.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Icon icon="mingcute:checklist-line" className="w-5 h-5 mr-2" />
              Checkpoints
            </h4>
            <div className="space-y-2">
              {checkpoints.map((checkpoint, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    completedCheckpoints.has(index)
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-card/50 border-border hover:bg-card/70 text-white/80'
                  }`}
                  onClick={() => handleCheckpointToggle(index)}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    completedCheckpoints.has(index)
                      ? 'bg-green-500 border-green-500'
                      : 'border-white/30'
                  }`}>
                    {completedCheckpoints.has(index) && (
                      <Icon icon="mingcute:check-line" className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm flex-1">{checkpoint}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Step Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index + 1 === currentStep
                    ? `${deviceInfo.bgColor} ${deviceInfo.borderColor} border-2 ${animationClass}`
                    : index + 1 < currentStep
                    ? 'bg-green-500'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
          {/* Primary Action */}
          <Button
            onClick={handleStepComplete}
            className={`w-full py-3 text-base font-semibold transition-all ${
              isCompleted
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            <Icon 
              icon={getStepIcon()} 
              className={`w-5 h-5 mr-2 ${getStepColor()}`} 
            />
            {isCompleted ? 'Step Completed!' : 'Mark as Complete'}
          </Button>

          {/* Secondary Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={onPreviousStep}
              disabled={currentStep === 1}
              variant="outline"
              className="flex-1 bg-transparent text-white border-white/30 hover:border-white/60 disabled:opacity-50"
            >
              <Icon icon="mingcute:arrow-left-line" className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              onClick={handleStepRetry}
              variant="outline"
              className="flex-1 bg-transparent text-white border-white/30 hover:border-white/60"
            >
              <Icon icon="mingcute:refresh-line" className="w-4 h-4 mr-1" />
              Retry
            </Button>
            
            <Button
              onClick={onNextStep}
              disabled={currentStep === totalSteps}
              variant="outline"
              className="flex-1 bg-transparent text-white border-white/30 hover:border-white/60 disabled:opacity-50"
            >
              Next
              <Icon icon="mingcute:arrow-right-line" className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
