import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward, RotateCcw, CheckCircle } from 'lucide-react';
import { CameraFeed } from './CameraFeed';
import { ProgressTracker } from './ProgressTracker';
import { ChatInterface } from './ChatInterface';
import { useGuidanceStore } from '@/store/guidanceStore';
import { useTTS } from '@/hooks/useTTS';
import { aiService } from '@/lib/aiService';
import { DetectionResult } from '@shared/schema';

export const GuidanceInterface: React.FC = () => {
  const {
    currentSession,
    selectedLanguage,
    voicePreference,
    endSession,
    nextStep,
    previousStep
  } = useGuidanceStore();

  const { speak } = useTTS(voicePreference);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);

  useEffect(() => {
    if (!currentSession) return;

    const generateInstruction = async () => {
      try {
        const userAction = lastDetection?.userActions[0] || 'starting';
        const needsCorrection = lastDetection ? !lastDetection.deviceDetected : false;

        console.log('Generating guidance for:', {
          deviceType: currentSession.deviceType,
          currentStep: currentSession.currentStep,
          guidanceStyle: currentSession.guidanceStyle,
          language: selectedLanguage,
          userAction,
          needsCorrection,
          deviceDetected: lastDetection?.deviceDetected,
          confidence: lastDetection?.confidence
        });

        const guidance = await aiService.generateGuidance(
          currentSession.deviceType,
          currentSession.currentStep,
          selectedLanguage,
          currentSession.guidanceStyle,
          userAction,
          needsCorrection
        );

        console.log('AI generated guidance:', guidance);

        setCurrentInstruction(guidance.translatedInstruction);

        if (voicePreference !== 'text_only' && guidance.audioInstruction) {
          speak(guidance.audioInstruction, selectedLanguage);
        }

      } catch (error) {
        console.error('Failed to generate instruction:', error);
        setCurrentInstruction('Please continue to the next step');
      }
    };

    generateInstruction();
  }, [currentSession?.currentStep, currentSession?.guidanceStyle, lastDetection, selectedLanguage, voicePreference, speak]);

  const handleDetection = (detection: DetectionResult) => {
    setLastDetection(detection);
  };

  const handleBackToWelcome = () => {
    endSession();
  };

  if (!currentSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToWelcome}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Welcome
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Main Column */}
          <div className="lg:col-span-2">
            <CameraFeed
              deviceType={currentSession.deviceType}
              onDetection={handleDetection}
              isRecording={true}
            />
            
            {/* Audio Instructions Display */}
            <div className="mt-4 p-4 bg-slate-800/40 border border-slate-600/50 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">Current Step Instructions</span>
              </div>
              <p className="text-slate-100 text-sm mb-4">
                {currentInstruction || 'Loading instructions...'}
              </p>
              
              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-600/50">
                <div className="text-slate-400 text-xs">
                  Step {currentSession.currentStep + 1} of {currentSession.totalSteps}
                </div>
                
                <div className="flex gap-2">
                  {currentSession.currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={previousStep}
                      className="text-slate-300 border-slate-600 hover:bg-slate-700/50"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}
                  
                  {currentSession.currentStep < currentSession.totalSteps - 1 ? (
                    <Button
                      onClick={nextStep}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      Next Step
                    </Button>
                  ) : currentSession.currentStep === currentSession.totalSteps - 1 ? (
                    <Button
                      onClick={nextStep}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBackToWelcome}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      New Session
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => nextStep()}
                    className="text-slate-300 border-slate-600 hover:bg-slate-700/50"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Tracker */}
            <ProgressTracker 
              session={currentSession}
              currentInstruction={currentInstruction}
            />

            {/* Chat Interface */}
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};
