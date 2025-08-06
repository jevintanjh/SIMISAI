import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Languages, VolumeX, Settings, Play, Pause, Volume2 } from "lucide-react";
import { useVoice } from "@/hooks/use-voice";

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
    <div className="p-4 step-card">
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="medical-blue rounded-full w-10 h-10 flex items-center justify-center font-semibold text-white">
              {instruction.number}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {instruction.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {instruction.description}
              </p>

              {/* Multi-language Support */}
              {language !== "en" && instruction.translation[language as keyof typeof instruction.translation] && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-[hsl(207,90%,54%)] font-medium mb-2 flex items-center">
                    <Languages className="w-4 h-4 mr-2" />
                    {language === 'id' && 'Bahasa Indonesia:'}
                    {language === 'th' && 'ไทย:'}
                    {language === 'vi' && 'Tiếng Việt:'}
                    {language === 'fil' && 'Filipino:'}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {instruction.translation[language as keyof typeof instruction.translation]?.description}
                  </p>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex items-center space-x-4 mb-4">
                {instruction.checkpoints.map((checkpoint) => (
                  <div key={checkpoint} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      instruction.completedCheckpoints.includes(checkpoint)
                        ? "bg-[hsl(122,39%,49%)]"
                        : "bg-gray-300"
                    }`} />
                    <span className="text-sm text-gray-600">{checkpoint}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                onClick={handleNextStep}
                className="w-full detection-green hover:bg-[hsl(122,39%,45%)] text-white py-3 mb-4"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Voice Guidance Controls */}
              <div className="medical-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-[hsl(207,90%,54%)]" />
                    <span className="text-sm font-medium text-gray-700">Voice Guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <VolumeX className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
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
                    className="medical-blue hover:bg-[hsl(207,90%,50%)] p-2 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
