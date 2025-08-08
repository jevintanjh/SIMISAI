import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, Mic, Settings, Phone, Volume2 } from "lucide-react";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Main container with white border */}
      <div className="w-full max-w-7xl mx-auto bg-background border-2 border-white/20 rounded-2xl p-6 m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Step 1: Wrap the cuff around your arm
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-white text-sm">REC 0:08:41</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left: Camera View */}
          <div className="col-span-2">
            <Card className="bg-black border-border h-full relative overflow-hidden">
              <CardContent className="p-0 h-full">
                <MediaPipeCameraView onThermometerDetected={(detection) => {
                  console.log('Thermometer detected in guidance:', detection);
                }} />
                
                {/* Detection overlays */}
                <div className="absolute inset-4 pointer-events-none">
                  {/* Green bounding box for "Cuff" */}
                  <div className="absolute top-20 left-20 w-48 h-32 border-2 border-green-400 rounded">
                    <div className="bg-green-400 text-black px-2 py-1 text-xs font-medium rounded -mt-6">
                      Cuff
                    </div>
                  </div>
                  
                  {/* Yellow warning circle */}
                  <div className="absolute top-32 left-32 w-16 h-16 border-2 border-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-yellow-400 text-xs font-medium">Too loose</span>
                  </div>
                </div>
                
                {/* Camera controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                  <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="rounded-full w-10 h-10 p-0">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" className="rounded-full w-10 h-10 p-0">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Audio instruction bar */}
                <div className="absolute bottom-16 left-4 right-4">
                  <Card className="bg-card/90 border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(40)].map((_, i) => (
                              <div key={i} className={`w-1 rounded-full ${i < 15 ? 'bg-blue-500 h-2' : 'bg-gray-400 h-1'}`} />
                            ))}
                          </div>
                          <p className="text-card-foreground text-sm">
                            {instruction.audioDescription}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <div className="col-span-1 space-y-6">
            
            {/* Progress Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-lg mb-2">Step 1 of 5</h3>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: `${progress}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages/Chat Card */}
            <Card className="bg-card border-border flex-1">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h4 className="text-white font-medium mb-3">Messages</h4>
                  <span className="text-muted-foreground text-sm">You</span>
                </div>
                
                <div className="bg-secondary rounded-lg p-3 mb-4">
                  <p className="text-white font-medium text-sm">Why is the cuff too loose?</p>
                </div>
                
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-2 rounded text-sm ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-4' 
                          : 'bg-secondary text-secondary-foreground mr-4'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
                
                <p className="text-card-foreground text-sm mb-4">
                  Manset harus pas tetapi tidak ketat. Anda harus bisa menyelipkan satu jari di bawahnya dengan nyaman.
                </p>
                
                <div className="mt-auto">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Chat with Assistant"
                      className="flex-1 bg-input border-border rounded px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-primary/80"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}