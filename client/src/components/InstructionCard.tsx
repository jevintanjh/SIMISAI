import { useState } from "react";
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
}

export default function InstructionCard({ language, sessionId }: InstructionCardProps) {
  const [currentStep, setCurrentStep] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.2);
  const [isMuted, setIsMuted] = useState(false);
  
  const { speak, stop } = useVoice();

  // Mock data - in production, this would fetch from the API
  const instruction = {
    number: currentStep,
    title: "Wrap the Cuff Around Your Arm",
    description: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
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
        description: "Đặt vòng bít quanh cánh tay trên của bạn, cách khuỷu tay khoảng 1 inch. Vòng bít phải vừa khít nhưng không quá chặt."
      },
      fil: {
        title: "Ikabit ang Cuff sa Braso",
        description: "Ilagay ang cuff sa paligid ng inyong upper arm, mga 1 pulgada sa itaas ng siko. Ang cuff ay dapat makakasya ngunit hindi masyadong mahigpit."
      }
    },
    checkpoints: ["Cuff Position", "Tightness Check"],
    completedCheckpoints: ["Cuff Position"]
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
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  return (
    <div className="step-card h-full">
      <Card className="shadow-lg border border-[rgba(139,92,246,0.3)] h-full" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
        <CardContent className="p-6 flex flex-col h-full">
          {/* Step Progress - Big H2 at the top, left-aligned */}
          <h2 className="text-2xl font-bold text-white mb-4 text-left">
            Step {instruction.number} of 5
          </h2>
          
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg mb-3">
                {language !== "en" && instruction.translation[language as keyof typeof instruction.translation]
                  ? instruction.translation[language as keyof typeof instruction.translation]?.title || instruction.title
                  : instruction.title}
              </h3>
              <p className="text-white mb-4 leading-relaxed">
                {language !== "en" && instruction.translation[language as keyof typeof instruction.translation]
                  ? instruction.translation[language as keyof typeof instruction.translation]?.description || instruction.description
                  : instruction.description}
              </p>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-4 mb-4">
                {instruction.checkpoints.map((checkpoint) => (
                  <div key={checkpoint} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      instruction.completedCheckpoints.includes(checkpoint)
                        ? "bg-[#10B981]"
                        : "bg-[#94A3B8]"
                    }`} />
                    <span className="text-white text-sm">{checkpoint}</span>
                  </div>
                ))}
              </div>
              
              {/* Action Button */}
              <Button 
                onClick={handleNextStep}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white py-3 mb-4 shadow-lg"
              >
                Continue
                <Icon icon="mingcute:large-arrow-right-fill" className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            {/* Voice Guidance Controls */}
            <div className="bg-[rgba(139,92,246,0.1)] rounded-lg p-4 border border-[rgba(139,92,246,0.3)]">
              <div className="mb-3">
                <span className="text-sm font-bold text-white">Voice Guidance</span>
              </div>
              <div className="text-white text-sm mb-3">
                Playing in {
                  language === 'en' ? 'English' :
                  language === 'id' ? 'Bahasa Indonesia' :
                  language === 'th' ? 'ไทย' :
                  language === 'vi' ? 'Tiếng Việt' :
                  language === 'fil' ? 'Filipino' : 'English'
                }
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handlePlayPause}
                  size="sm"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white p-2 rounded-full shadow-lg"
                >
                  {isPlaying ? (
                    <Icon icon="mingcute:pause-fill" className="w-4 h-4" />
                  ) : (
                    <Icon icon="mingcute:play-fill" className="w-4 h-4" />
                  )}
                </Button>
                <div className="flex-1">
                  <label className="text-white text-xs block mb-1">
                    Speed: {playbackSpeed}x
                  </label>
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
