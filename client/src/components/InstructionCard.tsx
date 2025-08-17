import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Languages, VolumeX, Settings, Play, Pause, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";
import { Icon } from "@iconify/react";

interface InstructionCardProps {
  language: string;
  sessionId: string | null;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  description?: string;
  checkpoints?: string[];
  onNextStep?: () => void;
  onPreviousStep?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export default function InstructionCard({ 
  language, 
  sessionId, 
  currentStep: propCurrentStep = 1, 
  totalSteps = 5, 
  title: propTitle, 
  description: propDescription, 
  checkpoints: propCheckpoints = [], 
  onNextStep, 
  onPreviousStep, 
  canGoNext = true, 
  canGoPrevious = true 
}: InstructionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([]);
  
  const { speak, stop } = useVoice();

  // Use props if provided, otherwise fall back to mock data
  const instruction = {
    number: propCurrentStep,
    title: propTitle || "Wrap the Cuff Around Your Arm",
    description: propDescription || "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
    translation: {
      id: {
        title: "Lingkarkan Manset di Lengan Anda",
        description: "Lingkarkan manset di sekitar lengan atas Anda, sekitar 1 inci di atas siku. Manset harus pas tetapi tidak terlalu ketat."
      },
      th: {
        title: "พันข้อมือรอบแขน",
        description: "วางข้อมือรอบต้นแขนของคุณ ประมาณ 1 นิ้วเหนือข้อศอก ข้อมือควรพอดีแต่ไม่แน่นเกินไป"
      },
      vi: {
        title: "Quấn vòng bít quanh cánh tay",
        description: "Đặt vòng bít quanh cánh tay trênของคุณ, cách khuỷu tay khoảng 1 inch. Vòng bít phải vừa khít nhưng không quá chặt."
      },
      fil: {
        title: "Ikabit ang Cuff sa Braso",
        description: "Ilagay ang cuff sa paligid ng inyong upper arm, mga 1 pulgada sa itaas ng siko. Ang cuff ay dapat makakasya ngunit hindi masyadong mahigpit."
      }
    },
    checkpoints: propCheckpoints.length > 0 ? propCheckpoints : ["Cuff Position", "Tightness Check"]
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      let textToSpeak = instruction.description;
      if (language !== "en" && instruction.translation[language as keyof typeof instruction.translation]) {
        textToSpeak = instruction.translation[language as keyof typeof instruction.translation]?.description || instruction.description;
      }
      if (textToSpeak) {
        speak(textToSpeak, language, playbackSpeed);
        setIsPlaying(true);
      }
    }
  };

  const handleNextStep = () => {
    if (onNextStep) {
      onNextStep();
    }
  };

  const toggleCheckpoint = (checkpoint: string) => {
    setCompletedCheckpoints(prev => 
      prev.includes(checkpoint)
        ? prev.filter(c => c !== checkpoint)
        : [...prev, checkpoint]
    );
  };

  // Reset checkpoints when step changes
  useEffect(() => {
    setCompletedCheckpoints([]);
  }, [propCurrentStep]);

  return (
    <div className="step-card h-full">
      <Card className="shadow-lg border border-[rgba(139,92,246,0.3)] h-full" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-6 flex flex-col h-full">
          {/* Progress Bar with Steps - Compact at the top */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-white/80 mb-2">
              <span className="font-medium">Progress</span>
              <span className="text-xs text-white/60">Step {instruction.number} of {totalSteps}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCheckpoints.length / instruction.checkpoints.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg mb-3 leading-tight">
                {language !== "en" && instruction.translation[language as keyof typeof instruction.translation]
                  ? instruction.translation[language as keyof typeof instruction.translation]?.title || instruction.title
                  : instruction.title}
              </h3>
              <p className="text-white/90 text-sm leading-tight mb-4">
                {language !== "en" && instruction.translation[language as keyof typeof instruction.translation]
                  ? instruction.translation[language as keyof typeof instruction.translation]?.description || instruction.description
                  : instruction.description}
              </p>

              {/* Interactive Checkpoints */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-3">
                <h4 className="text-sm font-semibold text-white/90 mb-2 flex items-center">
                  <Icon icon="mingcute:check-list-line" className="w-4 h-4 mr-2 text-primary" />
                  Checklist
                </h4>
                <div className="space-y-2">
                  {instruction.checkpoints.map((checkpoint) => (
                    <div 
                      key={checkpoint} 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 transition-colors"
                      onClick={() => toggleCheckpoint(checkpoint)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          completedCheckpoints.includes(checkpoint)
                            ? 'bg-green-500 border-green-500 scale-110' // Completed with scale
                            : 'border-white/40 bg-transparent hover:border-white/60' // Pending with hover
                        }`}>
                          {completedCheckpoints.includes(checkpoint) && (
                            <Icon icon="mingcute:check-line" className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-medium transition-colors ${
                        completedCheckpoints.includes(checkpoint)
                          ? 'text-green-400 opacity-75' // Completed, slightly dimmed
                          : 'text-white/80' // Pending
                      }`}>
                        {checkpoint}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              {canGoNext && (
                <div className="flex space-x-3 mb-3">
                  {canGoPrevious && (
                    <Button 
                      onClick={onPreviousStep}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Icon icon="mingcute:arrow-to-left-fill" className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  <Button 
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white py-3 shadow-lg text-base font-semibold"
                  >
                    Next
                    <Icon icon="mingcute:large-arrow-right-fill" className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
              
              {/* Completion Celebration */}
              {!canGoNext && (
                <div className="text-center py-4 px-6 bg-green-500/10 border border-green-500/20 rounded-lg mb-3">
                  <Icon icon="mingcute:check-circle-fill" className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-green-400 font-semibold mb-1">Congratulations!</h3>
                  <p className="text-green-400/80 text-sm">You've completed all steps successfully.</p>
                </div>
              )}
            </div>
            
            {/* Voice Guidance Controls */}
            <div className="bg-[rgba(139,92,246,0.1)] rounded-lg p-3 border border-[rgba(139,92,246,0.3)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Voice Guidance</span>
                <span className="text-xs text-white/80">
                  <span className="font-semibold">
                    {language === 'en' ? 'English' : 
                     language === 'id' ? 'Bahasa Indonesia' :
                     language === 'th' ? 'ไทย' :
                     language === 'vi' ? 'Tiếng Việt' :
                     language === 'fil' ? 'Filipino' : 'English'}
                  </span> • <span className="font-semibold">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handlePlayPause}
                  size="sm"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white p-2 rounded-full shadow-lg w-8 h-8"
                >
                  {isPlaying ? (
                    <Icon icon="mingcute:pause-fill" className="w-4 h-4" />
                  ) : (
                    <Icon icon="mingcute:play-fill" className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-white mb-2">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>1.5x</span>
                    <span>2.0x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={(value) => setPlaybackSpeed(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
