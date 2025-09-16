import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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

// Welcome page tutorial steps
const welcomeTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'welcome-title',
    title: 'Welcome to SIMIS!',
    description: 'Let me show you around the app. This is your AI-powered medical device guidance assistant.',
    position: 'bottom',
    action: 'Click anywhere to continue'
  },
  {
    id: 'device-selection',
    target: 'device-selection-card',
    title: 'Select Your Device',
    description: 'Choose from our 3 supported devices: Oral Thermometer, Ear Thermometer, or Blood Pressure Monitor.',
    position: 'bottom',
    action: 'Click on your device type'
  },
  {
    id: 'advanced-toggle',
    target: 'advanced-toggle',
    title: 'Advanced Setup',
    description: 'Need more control? Click here to access advanced settings for language, guidance style, and voice options.',
    position: 'top',
    action: 'Try the advanced setup'
  },
  {
    id: 'start-button',
    target: 'start-button',
    title: 'Ready to Start!',
    description: 'Once you\'ve selected your device, click here to begin your guided experience.',
    position: 'top',
    action: 'Start your session'
  }
];

// Guidance page tutorial steps
const guidanceTutorialSteps: TutorialStep[] = [
  {
    id: 'camera-view',
    target: 'camera-view',
    title: 'Camera View',
    description: 'This is your camera view where SIMIS will detect and guide you through using your medical device.',
    position: 'right',
    action: 'Position your device in view'
  },
  {
    id: 'instructions-panel',
    target: 'instructions-panel',
    title: 'Instructions Panel',
    description: 'Here you\'ll see step-by-step instructions for your device. Follow along as SIMIS guides you.',
    position: 'left',
    action: 'Read the instructions carefully'
  },
  {
    id: 'chat-toggle',
    target: 'chat-toggle',
    title: 'Chat with SIMIS',
    description: 'Click here to switch to chat mode where you can ask questions or get help from SIMIS.',
    position: 'left',
    action: 'Try chatting with SIMIS'
  }
];

export default function OnboardingTutorial({ isVisible, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Determine which tutorial steps to use based on current page
  const getTutorialSteps = (): TutorialStep[] => {
    // Check if we're on the guidance page by looking for guidance-specific elements
    const hasGuidanceElements = document.querySelector('[data-tutorial="camera-view"]') !== null;
    return hasGuidanceElements ? guidanceTutorialSteps : welcomeTutorialSteps;
  };

  const tutorialSteps = getTutorialSteps();
  const currentTutorialStep = tutorialSteps[currentStep];

  // Find and position the target element
  useEffect(() => {
    if (!isVisible || !currentTutorialStep) return;

    const element = document.querySelector(`[data-tutorial="${currentTutorialStep.target}"]`) as HTMLElement;
    if (element) {
      setTargetElement(element);
      updateTooltipPosition(element);
    } else {
      // If element not found, try to find it after a short delay (for dynamic content)
      const timeoutId = setTimeout(() => {
        const retryElement = document.querySelector(`[data-tutorial="${currentTutorialStep.target}"]`) as HTMLElement;
        if (retryElement) {
          setTargetElement(retryElement);
          updateTooltipPosition(retryElement);
        } else {
          // Still not found, center the tooltip in the viewport
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          setTargetElement(null);
          setTooltipPosition({
            top: viewportHeight / 2 + scrollTop,
            left: viewportWidth / 2
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
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
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    // Adjust position based on tooltip position preference
    const tooltipWidth = 320; // max-w-sm = 24rem = 384px, but we'll use 320 for safety
    const tooltipHeight = 200; // estimated height
    const spacing = 20; // Very close spacing - almost touching the element

    switch (currentTutorialStep?.position) {
      case 'top':
        top = rect.top + scrollTop - tooltipHeight - spacing;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + spacing;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        left = rect.left + scrollLeft - spacing;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + scrollLeft + spacing;
        break;
    }

    // Ensure tooltip stays within viewport bounds

    // Horizontal bounds checking - only adjust if completely out of bounds
    if (left < 0) {
      left = 10;
    } else if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 10;
    }

    // Vertical bounds checking - only adjust if completely out of bounds
    if (top < scrollTop) {
      top = scrollTop + 10;
    } else if (top + tooltipHeight > viewportHeight + scrollTop) {
      top = viewportHeight + scrollTop - tooltipHeight - 10;
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
      {/* Full dark overlay with cutout for highlighted element */}
      {targetElement ? (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          style={{
            background: `radial-gradient(ellipse at ${targetElement.getBoundingClientRect().left + window.pageXOffset + targetElement.getBoundingClientRect().width / 2}px ${targetElement.getBoundingClientRect().top + window.pageYOffset + targetElement.getBoundingClientRect().height / 2}px, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.5) 70%)`
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/50 z-40" />
      )}
      
      {/* Highlighted element border */}
      {targetElement && (
        <div
          className="fixed z-50 pointer-events-none border-2 border-primary rounded-lg"
          style={{
            top: targetElement.getBoundingClientRect().top + window.pageYOffset - 4,
            left: targetElement.getBoundingClientRect().left + window.pageXOffset - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 max-w-sm"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: targetElement 
            ? (currentTutorialStep.position === 'top' || currentTutorialStep.position === 'bottom' 
                ? 'translateX(-50%)' 
                : currentTutorialStep.position === 'right' 
                ? 'translateY(-50%)' 
                : 'translateY(-50%) translateX(-100%)')
            : 'translate(-50%, -50%)', // Center when no target element
        }}
      >
        <Card className="bg-background border-2 border-primary shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    {/* Background ring */}
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-primary/20"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - (currentStep + 1) / tutorialSteps.length)}`}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Step number in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {currentStep + 1}
                    </span>
                  </div>
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
