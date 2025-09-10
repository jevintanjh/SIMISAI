import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";
import InstructionCard from "@/components/InstructionCard";
import EnhancedInstructionCard from "@/components/EnhancedInstructionCard";
import FloatingChat from "@/components/FloatingChat";
import SessionSummary from "@/components/SessionSummary";
import EnhancedChat from "@/components/EnhancedChat";
import { useVoiceInput } from "@/hooks/use-voice-input";
import MobileOptimizedView, { useMobileDetection, accessibilityUtils } from "@/components/MobileOptimizedView";
import { LoadingSpinner, ErrorDisplay, ProgressIndicator, ConnectionStatus } from "@/components/LoadingStates";
import { Icon } from "@iconify/react";

interface Instruction {
  id: string;
  deviceId: string;
  stepNumber: number;
  title: string;
  description: string;
  translations: {
    [key: string]: {
      title: string;
      description: string;
    };
  } | null;
  audioUrl: string | null;
  imageUrl: string | null;
  checkpoints: string[] | null;
}

interface GuidanceProps {
  config: SessionConfig;
  onBack: () => void;
}

interface SessionConfig {
  language: string;
  device: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  guidanceStyle: string;
  voiceOption: string;
}

export default function Guidance({ config, onBack }: GuidanceProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [userQuestion, setUserQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: number, type: 'user' | 'ai', content: string}>>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<Instruction | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Session tracking
  const [sessionStartTime] = useState(Date.now());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [retryAttempts, setRetryAttempts] = useState<Map<number, number>>(new Map());
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Voice input
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    transcript, 
    error: voiceError, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceInput();

  // Mobile detection
  const isMobile = useMobileDetection();

  // Fetch instructions from server
  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        
        // First, get all devices to find the thermometer
        const devicesResponse = await fetch('/api/devices');
        if (devicesResponse.ok) {
          const devices = await devicesResponse.json();
          const thermometerDevice = devices.find((device: any) => device.type === 'thermometer');
          
          if (thermometerDevice) {
            // Now fetch instructions for the thermometer device
            const instructionsResponse = await fetch(`/api/devices/${thermometerDevice.id}/instructions`);
            if (instructionsResponse.ok) {
              const data = await instructionsResponse.json();
              setInstructions(data);
              setTotalSteps(data.length);
              if (data.length > 0) {
                setCurrentInstruction(data[0]); // Start with first step
              }
            }
          } else {
            console.error('Thermometer device not found');
            setInstructions([]);
            setTotalSteps(0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
        // Fallback to mock data if API fails
        setInstructions([]);
        setTotalSteps(0);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  // Update current instruction when step changes
  useEffect(() => {
    if (instructions.length > 0) {
      const instruction = instructions.find(inst => inst.stepNumber === currentStep);
      if (instruction) {
        setCurrentInstruction(instruction);
        setProgress((currentStep / totalSteps) * 100);
      }
    }
  }, [currentStep, instructions, totalSteps]);

  // Get instruction for current step
  const getInstructionForStep = (step: number) => {
    if (!currentInstruction) return null;
    
    const language = config.language || 'en';
    const translation = currentInstruction.translations?.[language];
    
    return {
      title: translation?.title || currentInstruction.title,
      description: translation?.description || currentInstruction.description,
      checkpoints: currentInstruction.checkpoints || []
    };
  };

  const instruction = getInstructionForStep(currentStep);

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || userQuestion;
    if (messageToSend.trim()) {
      const newUserMessage = {
        id: Date.now(),
        type: 'user' as const,
        content: messageToSend,
        timestamp: new Date()
      };
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: "Manset harus pas tetapi tidak ketat. Anda harus bisa menyelipkan satu jari di bawahnya dengan nyaman.",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, newUserMessage, aiResponse]);
      setUserQuestion("");
      
      // Auto-scroll to bottom after adding messages
      setTimeout(() => {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setUserQuestion(transcript);
    }
  }, [transcript]);

  const handleStepComplete = (stepNumber: number) => {
    setCompletedSteps(prev => new Set([...prev, stepNumber]));
    
    // Move to next step
    if (stepNumber < totalSteps) {
      setCurrentStep(stepNumber + 1);
      setProgress(((stepNumber + 1) / totalSteps) * 100);
    } else {
      // Session completed
      setSessionCompleted(true);
      setShowSessionSummary(true);
    }
  };

  const handleStepRetry = (stepNumber: number) => {
    setRetryAttempts(prev => {
      const newMap = new Map(prev);
      newMap.set(stepNumber, (newMap.get(stepNumber) || 0) + 1);
      return newMap;
    });
  };

  const generateSessionSummary = () => {
    const timeSpent = Date.now() - sessionStartTime;
    const successRate = Math.round((completedSteps.size / totalSteps) * 100);
    const totalRetries = Array.from(retryAttempts.values()).reduce((sum, attempts) => sum + attempts, 0);
    
    // Generate key learnings based on completed steps
    const keyLearnings = [
      `Successfully completed ${completedSteps.size} out of ${totalSteps} steps`,
      `Device: ${config.deviceBrand} ${config.deviceModel}`,
      `Language: ${config.language}`,
      `Guidance style: ${config.guidanceStyle}`,
    ];

    // Generate areas for improvement based on retry attempts
    const areasForImprovement = [];
    if (totalRetries > 0) {
      areasForImprovement.push(`Consider reviewing steps with retry attempts for better understanding`);
    }
    if (successRate < 80) {
      areasForImprovement.push(`Focus on following instructions more carefully`);
    }
    if (timeSpent > 30 * 60 * 1000) { // 30 minutes
      areasForImprovement.push(`Try to work more efficiently to reduce session time`);
    }

    // Generate common issues based on chat messages
    const commonIssues = [];
    const errorMessages = chatMessages.filter(msg => 
      msg.type === 'ai' && (
        msg.content.toLowerCase().includes('error') ||
        msg.content.toLowerCase().includes('incorrect') ||
        msg.content.toLowerCase().includes('wrong')
      )
    );
    
    if (errorMessages.length > 0) {
      commonIssues.push(`Encountered ${errorMessages.length} error-related questions during session`);
    }

    return {
      device: config.device,
      deviceType: config.deviceType,
      deviceBrand: config.deviceBrand,
      deviceModel: config.deviceModel,
      language: config.language,
      guidanceStyle: config.guidanceStyle,
      totalSteps,
      completedSteps: completedSteps.size,
      timeSpent,
      successRate,
      keyLearnings,
      areasForImprovement,
      commonIssues,
    };
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Error handling
  const resetError = () => {
    setError(null);
  };

  // Connection monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      accessibilityUtils.announce('Connection restored');
    };

    const handleOffline = () => {
      setIsConnected(false);
      accessibilityUtils.announce('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white">
        <ErrorDisplay error={error} resetError={resetError} />
      </div>
    );
  }

  return (
    <MobileOptimizedView isMobile={isMobile} className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white">
      {/* Header */}
      <header className="bg-transparent text-white p-6 relative">
        {/* Back Button and Session Configuration Container - Left Aligned */}
        <div className="flex items-center gap-4">
          <Card className="bg-card/50 border-border backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors" onClick={onBack}>
            <CardContent className="px-6 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon icon="mingcute:arrow-to-left-fill" className="w-7 h-7 text-white/70" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Back</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Session Configuration */}
          <div className="flex gap-4">
            {/* Device Option Box */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:cellphone-vibration-line" className="w-7 h-7 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {config.device === 'thermometer' ? 'Digital thermometer' :
                       config.device === 'ear' ? 'Ear thermometer' :
                       config.device === 'forehead' ? 'Forehead thermometer' :
                       config.device === 'blood-pressure' ? 'Blood pressure monitor' :
                       config.device === 'glucose' ? 'Blood glucose meter' : config.device}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Option Box */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:world-2-line" className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {config.language === 'en' ? 'English' :
                       config.language === 'id' ? 'Bahasa Indonesia' :
                       config.language === 'th' ? 'ไทย' :
                       config.language === 'vi' ? 'Tiếng Việt' :
                       config.language === 'fil' ? 'Filipino' : 'English'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidance Style Option Box */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:settings-1-line" className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {config.guidanceStyle === 'direct' ? 'Direct instructions' :
                       config.guidanceStyle === 'gentle' ? 'Gentle suggestions' :
                       config.guidanceStyle === 'detailed' ? 'Detailed explanations' : config.guidanceStyle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Option Box */}
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardContent className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:mic-ai-line" className="w-7 h-7 text-white/80" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {config.voiceOption === 'male' ? 'Male' :
                       config.voiceOption === 'female' ? 'Female' :
                       config.voiceOption === 'text' ? 'Text only' : config.voiceOption}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Summary Button */}
            <Card className="bg-card/50 border-border backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowSessionSummary(true)}>
              <CardContent className="px-6 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:chart-line" className="w-7 h-7 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">Session Summary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Main Content - Two Panel Layout */}
      <main className="max-w-8xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Left Panel: Camera View (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="h-full min-h-[600px] rounded-xl overflow-hidden">
              <MediaPipeCameraView 
                onThermometerDetected={(detection) => {
                  console.log('Device detected:', detection);
                }}
                sessionConfig={config}
                language={config.language}
                sessionId="guidance-session"
              />
            </div>
          </div>
          
          {/* Right Panel: Instructions + Chat (1/3 width) */}
          <div className="lg:col-span-1">
            {showInstructions ? (
              <div className="bg-card border border-border rounded-lg shadow-lg p-4 h-full min-h-[600px] flex flex-col">
                {/* Instruction Card */}
                <div className="flex-1">
                  {loading ? (
                    <LoadingSpinner 
                      size="lg" 
                      text="Loading instructions..." 
                      className="h-full"
                    />
                  ) : instruction ? (
                    <EnhancedInstructionCard 
                      language={config.language}
                      sessionId="guidance-session"
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      title={instruction.title}
                      description={instruction.description}
                      checkpoints={instruction.checkpoints}
                      onNextStep={handleNextStep}
                      onPreviousStep={handlePreviousStep}
                      onStepComplete={handleStepComplete}
                      onStepRetry={handleStepRetry}
                      deviceType={config.deviceType}
                      deviceBrand={config.deviceBrand}
                      deviceModel={config.deviceModel}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">No instructions available</p>
                    </div>
                  )}
                </div>
                
                {/* Toggle to Chat Button */}
                <div className="mt-4 flex-shrink-0">
                  <Button 
                    onClick={toggleInstructions}
                    className="w-full bg-primary text-white hover:bg-primary transition-colors text-base font-semibold py-4"
                  >
                    Chat with Assistant
                    <Icon icon="mingcute:chat-4-fill" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg shadow-lg h-full min-h-[600px] flex flex-col">
                {/* Toggle to Instructions Button - Above chat box */}
                <div className="p-4 border-b border-border flex-shrink-0">
                  <Button 
                    onClick={toggleInstructions}
                    className="w-full bg-primary text-white hover:bg-primary transition-colors text-base font-semibold py-4"
                  >
                    <Icon icon="mingcute:list-expansion-fill" className="w-5 h-5" />
                    View Instructions
                  </Button>
                </div>
                
                {/* Enhanced Chat Component */}
                <div className="flex-1 min-h-0">
                  <EnhancedChat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onVoiceInput={handleVoiceInput}
                    isVoiceEnabled={isVoiceSupported && config.voiceOption !== 'text'}
                    isListening={isListening}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Session Summary Modal */}
      {showSessionSummary && (
        <SessionSummary
          sessionData={generateSessionSummary()}
          onClose={() => setShowSessionSummary(false)}
          onExport={() => {
            // Export functionality is handled in the SessionSummary component
          }}
          onShare={() => {
            // Share functionality can be implemented here
            if (navigator.share) {
              navigator.share({
                title: 'SIMIS AI Session Summary',
                text: `Completed ${completedSteps.size}/${totalSteps} steps with ${Math.round((completedSteps.size / totalSteps) * 100)}% success rate`,
                url: window.location.href
              });
            }
          }}
        />
      )}

      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected} 
        isReconnecting={isReconnecting} 
      />
    </MobileOptimizedView>
  );
}