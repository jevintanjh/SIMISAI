import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'welcome-title',
    title: 'Welcome to SIMIS AI!',
    description: 'Let me show you around the app. This is your AI-powered medical device guidance assistant.',
    position: 'bottom',
    action: 'Click anywhere to continue'
  },
  {
    id: 'device-selection',
    target: 'device-selection-card',
    title: 'Device Selection',
    description: 'Start by selecting your medical device type. We support thermometers, blood pressure monitors, and more.',
    position: 'bottom',
    action: 'Try selecting a device'
  },
  {
    id: 'device-type',
    target: 'device-type-card',
    title: 'Device Category',
    description: 'Choose the category that best fits your device. This helps us provide more accurate guidance.',
    position: 'bottom',
    action: 'Select a category'
  },
  {
    id: 'device-brand',
    target: 'device-brand-card',
    title: 'Device Brand',
    description: 'Select your device brand for model-specific instructions. Popular brands include Omron, Braun, and more.',
    position: 'bottom',
    action: 'Choose your brand'
  },
  {
    id: 'device-model',
    target: 'device-model-card',
    title: 'Device Model',
    description: 'Pick your specific device model for the most accurate guidance and troubleshooting.',
    position: 'bottom',
    action: 'Select your model'
  },
  {
    id: 'language',
    target: 'language-card',
    title: 'Language Selection',
    description: 'Choose your preferred language for instructions and voice guidance.',
    position: 'bottom',
    action: 'Pick your language'
  },
  {
    id: 'guidance-style',
    target: 'guidance-card',
    title: 'Guidance Style',
    description: 'Select how you prefer to receive instructions - direct, gentle, or detailed explanations.',
    position: 'bottom',
    action: 'Choose your style'
  },
  {
    id: 'voice-options',
    target: 'voice-card',
    title: 'Voice Options',
    description: 'Choose your preferred voice assistant or text-only mode.',
    position: 'bottom',
    action: 'Select voice option'
  },
  {
    id: 'start-button',
    target: 'start-button',
    title: 'Ready to Start!',
    description: 'Once you\'ve configured your session, click here to begin your guided experience.',
    position: 'top',
    action: 'Start your session'
  }
];

export default function OnboardingTutorial({ isVisible, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentTutorialStep = tutorialSteps[currentStep];

  // Find and position the target element
  useEffect(() => {
    if (!isVisible || !currentTutorialStep) return;

    const element = document.querySelector(`[data-tutorial="${currentTutorialStep.target}"]`) as HTMLElement;
    if (element) {
      setTargetElement(element);
      updateTooltipPosition(element);
    }
  }, [isVisible, currentStep, currentTutorialStep]);

  // Update tooltip position when window resizes
  useEffect(() => {
    if (!targetElement) return;

    const handleResize = () => updateTooltipPosition(targetElement);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement]);

  const updateTooltipPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    // Adjust position based on tooltip position preference
    switch (currentTutorialStep?.position) {
      case 'top':
        top = rect.top + scrollTop - 20;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 20;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.left + scrollLeft - 20;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.right + scrollLeft + 20;
        break;
    }

    setTooltipPosition({ top, left });
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible || !currentTutorialStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Highlighted element */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top + window.pageYOffset - 4,
            left: targetElement.getBoundingClientRect().left + window.pageXOffset - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 max-w-sm"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentTutorialStep.position === 'top' || currentTutorialStep.position === 'bottom' 
            ? 'translateX(-50%)' 
            : currentTutorialStep.position === 'right' 
            ? 'translateY(-50%)' 
            : 'translateY(-50%) translateX(-100%)',
        }}
      >
        <Card className="bg-background border-2 border-primary shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon icon="mingcute:lightbulb-line" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{currentTutorialStep.title}</h3>
                  <p className="text-white/60 text-xs">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Icon icon="mingcute:close-line" className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-white/80 text-sm mb-4">
              {currentTutorialStep.description}
            </p>

            {currentTutorialStep.action && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-primary text-sm font-medium">
                  💡 {currentTutorialStep.action}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="outline"
                  size="sm"
                  className="bg-transparent text-white border-white/20 hover:border-white/40"
                >
                  <Icon icon="mingcute:arrow-left-line" className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                  <Icon icon="mingcute:arrow-right-line" className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
