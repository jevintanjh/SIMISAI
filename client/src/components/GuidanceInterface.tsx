import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
    nextStep
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
  }, [currentSession?.currentStep, lastDetection, selectedLanguage, voicePreference, speak]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToWelcome}
            className="text-purple-200 hover:text-white hover:bg-purple-800/50"
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
            <div className="mt-4 p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm font-medium">Audio Instructions</span>
              </div>
              <p className="text-purple-100 text-sm">
                {currentInstruction || 'Loading instructions...'}
              </p>
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
