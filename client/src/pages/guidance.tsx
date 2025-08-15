import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, Mic, Settings, Phone, Volume2, Bot, User, Send } from "lucide-react";
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
  const [isSending, setIsSending] = useState(false);
  const [deviceHint, setDeviceHint] = useState<{ type?: string; label?: string; confidence?: number } | null>(null);
  const sessionId = `guidance-${Date.now().toString(36)}`;

  const introByLang: Record<string, string> = {
    en: "Hi! I’m SIMIS AI. Ask me anything about the medical device you’re using. Tips: describe the step you’re on, what you’re seeing, or what’s unclear. I’ll answer briefly with step‑by‑step guidance.",
    id: "Hai! Saya SIMIS AI. Tanyakan apa saja tentang perangkat medis yang Anda gunakan. Tips: jelaskan langkah yang sedang Anda lakukan, apa yang Anda lihat, atau yang belum jelas. Saya akan menjawab singkat dan bertahap.",
    th: "สวัสดีครับ/ค่ะ ฉันคือ SIMIS AI ถามได้ทุกอย่างเกี่ยวกับอุปกรณ์ทางการแพทย์ของคุณ เคล็ดลับ: บอกขั้นตอนที่ทำอยู่ สิ่งที่เห็น หรือส่วนที่ยังไม่ชัดเจน ฉันจะตอบแบบสั้นและเป็นขั้นตอน",
    vi: "Xin chào! Tôi là SIMIS AI. Hãy hỏi bất cứ điều gì về thiết bị y tế bạn đang dùng. Gợi ý: mô tả bước bạn đang làm, những gì bạn thấy hoặc điều chưa rõ. Tôi sẽ trả lời ngắn gọn theo từng bước.",
    fil: "Hi! Ako si SIMIS AI. Magtanong tungkol sa medical device na gamit mo. Tip: ilahad ang kasalukuyang hakbang, nakikita mo, o hindi malinaw. Sasagot ako nang maikli at sunod‑sunod na hakbang."
  };

  // Mock instruction based on step
  const getInstructionForStep = (step: number) => {
    const instructions = {
      1: {
        title: "Wrap the cuff around your arm",
        description: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
        audioDescription: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight."
      }
    };
    return instructions[step as keyof typeof instructions] || instructions[1];
  };

  const instruction = getInstructionForStep(currentStep);

  const handleSendMessage = async () => {
    const question = userQuestion.trim();
    if (!question) return;
    const newUserMessage = { id: Date.now(), type: 'user' as const, content: question };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserQuestion("");
    setIsSending(true);
    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          question,
          language: config.language || 'en',
          deviceHint: deviceHint || { type: config.device }
        })
      });
      const data = await res.json();
      const answer: string = data?.message?.message || data?.message?.content || data?.answer || 'Sorry, I could not generate a response.';
      setChatMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', content: answer }]);
    } catch {
      setChatMessages(prev => [...prev, { id: Date.now() + 2, type: 'ai', content: 'Sorry, there was a problem. Please try again.' }]);
    } finally {
      setIsSending(false);
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
                  setDeviceHint({ type: 'thermometer', label: 'Thermometer', confidence: detection?.confidence || 0.9 });
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
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <Bot className="w-4 h-4" /> Assistant
                  </h4>
                </div>
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
                  {/* Intro bubble */}
                  <div className="flex items-start gap-2 mr-6">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-md text-sm leading-relaxed bg-white/10 text-white border border-white/15 shadow-sm prose prose-invert">
                      <p>{introByLang[config.language] || introByLang.en}</p>
                    </div>
                  </div>
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-2 ${message.type === 'user' ? 'justify-end' : ''}`}>
                      {message.type !== 'user' && (
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`p-3 rounded-md text-sm leading-relaxed max-w-[90%] ${
                        message.type === 'user'
                          ? 'bg-primary/90 text-primary-foreground ml-6 rounded-tr-none'
                          : 'bg-white/10 text-white border border-white/15 shadow-sm mr-6 rounded-tl-none prose prose-invert whitespace-pre-wrap'
                      }`}>
                        {message.content}
                      </div>
                      {message.type === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ask a question about your device"
                      className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button size="sm" onClick={handleSendMessage} className="bg-primary hover:bg-primary/80 w-10 h-10 rounded-lg" disabled={isSending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {deviceHint && (
                    <p className="mt-2 text-[10px] text-muted-foreground">Context: {deviceHint.type || deviceHint.label} {deviceHint.confidence ? `(${Math.round((deviceHint.confidence||0)*100)}%)` : ''}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}