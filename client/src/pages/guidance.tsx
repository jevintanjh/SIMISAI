import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";
import InstructionCard from "@/components/InstructionCard";
import FloatingChat from "@/components/FloatingChat";

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

  // Mock instruction based on step
  const getInstructionForStep = (step: number) => {
    const instructions = {
      1: {
        title: "Wrap the cuff around your arm",
        description: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
        audioDescription: "Pasangkan manset di sekitar lengan atas Anda, sekitar 2,5 cm di atas siku. Manset harus pas, tetapi tidak terlalu ketat."
      }
    };
    return instructions[step as keyof typeof instructions] || instructions[1];
  };

  const instruction = getInstructionForStep(currentStep);

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
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 flex items-center gap-2 border border-white/20 rounded-lg px-4 py-3"
          >
            <Icon icon="mingcute:arrow-to-left-fill" className="w-5 h-5" />
            Back
          </Button>
          
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
                  <InstructionCard 
                    language={config.language}
                    sessionId="guidance-session"
                  />
                </div>
                
                {/* Toggle to Chat Button */}
                <div className="mt-4 flex-shrink-0">
                  <Button 
                    onClick={toggleInstructions}
                    className="w-full bg-primary text-white hover:bg-white hover:text-primary transition-colors border border-primary hover:border-primary/20"
                  >
                    Chat with Assistant
                    <Icon icon="mingcute:chat-4-fill" className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg shadow-lg p-4 h-full min-h-[600px] flex flex-col">
                {/* Toggle to Instructions Button - Above chat box */}
                <div className="mb-4 flex-shrink-0">
                  <Button 
                    onClick={toggleInstructions}
                    className="w-full bg-primary text-white hover:bg-white hover:text-primary transition-colors border border-primary hover:border-primary/20"
                  >
                    <Icon icon="mingcute:list-expansion-fill" className="w-4 h-4 mr-2" />
                    View Instructions
                  </Button>
                </div>
                
                {/* Chat Assistant - Styled to match Instruction Card */}
                <div className="flex flex-col h-full min-h-0 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg p-4">
                  {/* Chat Header */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon icon="mingcute:chat-4-fill" className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">Chat with Assistant</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Hello! I'm here to help you with your medical device setup. Feel free to ask me any questions!</p>
                  </div>
                  
                  {/* Chat Messages - Takes up remaining space */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
                    {chatMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-primary text-white ml-4' 
                            : 'bg-background text-foreground mr-4 border border-border'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chat Input - Fixed at bottom */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex space-x-2 w-full">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-0"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSendMessage}
                        className="bg-primary hover:bg-primary/80 text-primary-foreground flex-shrink-0"
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