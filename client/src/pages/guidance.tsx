import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";
import InstructionCard from "@/components/InstructionCard";
import FloatingChat from "@/components/FloatingChat";
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
                
                {/* Chat Assistant - Styled to match Instruction Card */}
                <div className="flex flex-col h-full min-h-0 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg p-4">
                  {/* Chat Header */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">Chat with Assistant</h3>
                      <Icon icon="mingcute:chat-4-fill" className="w-6 h-6 mb-1 text-primary" />
                    </div>
                  </div>
                  
                  {/* Chat Messages - Takes up remaining space with fixed height */}
                  <div className="chat-messages flex-1 overflow-y-auto mb-4 space-y-3 min-h-0 max-h-[400px]">
                    {/* Assistant greeting message */}
                    <div className="bg-background text-foreground mr-4 p-3 rounded-lg border border-border">
                      <p className="text-sm">Hello! I'm here to help you with your medical device setup. Feel free to ask me any questions!</p>
                    </div>
                    
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary text-white ml-4' 
                            : 'bg-background text-foreground mr-4 border border-border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chat Input - Fixed at bottom with constrained height */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex space-x-2 w-full">
                      <textarea
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-0 resize-none min-h-[40px] max-h-[120px]"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={1}
                        style={{
                          height: 'auto',
                          minHeight: '40px',
                          maxHeight: '120px',
                          overflowY: 'auto'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSendMessage}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground flex-shrink-0 self-end"
                      >
                        <Icon icon="mingcute:send-fill" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}