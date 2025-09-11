import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { MediaPipeCameraView } from "../MediaPipeCameraView";
import InstructionCard from "../InstructionCard";
import FloatingChat from "../FloatingChat";
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
        const mockInstructions: Instruction[] = [
          {
            id: '1',
            deviceId: 'thermometer',
            stepNumber: 1,
            title: 'Prepare the thermometer',
            description: 'Remove the thermometer from its case and ensure it\'s clean and dry.',
            translations: null,
            audioUrl: null,
            imageUrl: null,
            checkpoints: ['Thermometer is clean', 'Thermometer is dry']
          },
          {
            id: '2',
            deviceId: 'thermometer',
            stepNumber: 2,
            title: 'Turn on the thermometer',
            description: 'Press the power button to turn on the thermometer. Wait for the display to show "Lo" or a similar ready indicator.',
            translations: null,
            audioUrl: null,
            imageUrl: null,
            checkpoints: ['Thermometer is turned on', 'Display shows ready indicator']
          },
          {
            id: '3',
            deviceId: 'thermometer',
            stepNumber: 3,
            title: 'Position correctly',
            description: 'Place the thermometer tip under your tongue, close your mouth gently, and hold it in place.',
            translations: null,
            audioUrl: null,
            imageUrl: null,
            checkpoints: ['Tip is under tongue', 'Mouth is closed', 'Holding still']
          },
          {
            id: '4',
            deviceId: 'thermometer',
            stepNumber: 4,
            title: 'Wait for measurement',
            description: 'Keep the thermometer in place until you hear a beep or see the temperature reading on the display.',
            translations: null,
            audioUrl: null,
            imageUrl: null,
            checkpoints: ['Waiting for beep', 'Temperature reading appears']
          },
          {
            id: '5',
            deviceId: 'thermometer',
            stepNumber: 5,
            title: 'Read and record',
            description: 'Read the temperature from the display and record it. Clean the thermometer before storing.',
            translations: null,
            audioUrl: null,
            imageUrl: null,
            checkpoints: ['Temperature is read', 'Thermometer is cleaned', 'Stored properly']
          }
        ];
        setInstructions(mockInstructions);
        setTotalSteps(mockInstructions.length);
        if (mockInstructions.length > 0) {
          setCurrentInstruction(mockInstructions[0]);
        }
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

  const handleSendMessage = () => {
    if (userQuestion.trim()) {
      const newUserMessage = {
        id: Date.now(),
        type: 'user' as const,
        content: userQuestion
      };
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai' as const,
        content: "Manset harus pas tetapi tidak ketat. Anda harus bisa menyelipkan satu jari di bawahnya dengan nyaman."
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

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white">
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
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Loading instructions...</p>
                      </div>
                    </div>
                  ) : instruction ? (
                    <InstructionCard 
                      language={config.language}
                      sessionId="guidance-session"
                      currentStep={currentStep}
                      totalSteps={totalSteps}
                      title={instruction.title}
                      description={instruction.description}
                      checkpoints={instruction.checkpoints}
                      onNextStep={handleNextStep}
                      onPreviousStep={handlePreviousStep}
                      canGoNext={currentStep < totalSteps}
                      canGoPrevious={currentStep > 1}
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
              <div className="bg-card border border-border rounded-lg shadow-lg p-4 h-full min-h-[600px] flex flex-col">
                {/* Toggle to Instructions Button - Above chat box */}
                <div className="mb-4 flex-shrink-0">
                  <Button 
                    onClick={toggleInstructions}
                    className="w-full bg-primary text-white hover:bg-primary transition-colors text-base font-semibold py-4"
                  >
                    <Icon icon="mingcute:list-expansion-fill" className="w-5 h-5" />
                    View Instructions
                  </Button>
                </div>
                
                {/* Chat Assistant */}
                <div className="flex flex-col h-full min-h-0">
                  <FloatingChat 
                    sessionId="guidance-session"
                    language={config.language}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}