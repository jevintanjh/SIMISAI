import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Temporarily removed Select component due to React hook issues
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Globe, Camera, Target, Volume2, Play } from "lucide-react";

interface WelcomeProps {
  onStartSession: (config: SessionConfig) => void;
}

interface SessionConfig {
  language: string;
  device: string;
  guidanceStyle: string;
  voiceOption: string;
}

export default function Welcome({ onStartSession }: WelcomeProps) {
  const [language, setLanguage] = useState<string>("");
  const [device, setDevice] = useState<string>("");
  const [guidanceStyle, setGuidanceStyle] = useState<string>("");
  const [voiceOption, setVoiceOption] = useState<string>("");

  const languages = [
    { value: "id", label: "🇮🇩 Bahasa Indonesia", flag: "🇮🇩" },
    { value: "ms", label: "🇲🇾 Bahasa Melayu", flag: "🇲🇾" },
    { value: "th", label: "🇹🇭 ภาษาไทย (Thai)", flag: "🇹🇭" },
    { value: "vi", label: "🇻🇳 Tiếng Việt", flag: "🇻🇳" },
    { value: "fil", label: "🇵🇭 Filipino", flag: "🇵🇭" },
    { value: "en", label: "🇺🇸 English", flag: "🇺🇸" },
    { value: "my", label: "🇲🇲 မြန်မာ (Myanmar)", flag: "🇲🇲" },
    { value: "lo", label: "🇱🇦 ລາວ (Lao)", flag: "🇱🇦" },
    { value: "km", label: "🇰🇭 ខ្មែរ (Khmer)", flag: "🇰🇭" },
    { value: "bn", label: "🇧🇳 Brunei Malay", flag: "🇧🇳" },
  ];

  const devices = [
    { value: "thermometer", label: "Blood pressure monitor", icon: "🩺" },
    { value: "infrared", label: "Infrared thermometer", icon: "🌡️" },
    { value: "glucose", label: "Blood glucose meter", icon: "💉" },
  ];

  const guidanceOptions = [
    { value: "direct", label: "Direct instructions", icon: "📋" },
    { value: "gentle", label: "Gentle suggestions", icon: "💡" },
    { value: "detailed", label: "Detailed explanations", icon: "📖" },
  ];

  const voiceOptions = [
    { value: "male", label: "Male voice", icon: "👨" },
    { value: "female", label: "Female voice", icon: "👩" },
    { value: "text", label: "Text only", icon: "📝" },
  ];

  const canStart = language && device && guidanceStyle && voiceOption;

  const handleStart = () => {
    if (canStart) {
      onStartSession({
        language,
        device,
        guidanceStyle,
        voiceOption,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Main container with white border */}
      <div className="w-full max-w-4xl bg-background border-2 border-white/20 rounded-2xl p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to SIMIS AI</h1>
          <div className="w-32 h-0.5 bg-white/30 mx-auto"></div>
        </div>

        <div className="flex items-center justify-center space-x-6 mb-8">
          {/* Language Selection */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 min-w-48">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">Language</span>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Device Selection */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 min-w-48">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">Device</span>
              </div>
              <select 
                value={device} 
                onChange={(e) => setDevice(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select device</option>
                {devices.map((dev) => (
                  <option key={dev.value} value={dev.value}>
                    {dev.icon} {dev.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Guidance Style */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 min-w-48">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">Guidance</span>
              </div>
              <select 
                value={guidanceStyle} 
                onChange={(e) => setGuidanceStyle(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select style</option>
                {guidanceOptions.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.icon} {style.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Voice Options */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 min-w-48">
              <div className="flex items-center space-x-3 mb-4">
                <Volume2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-card-foreground">Voice</span>
              </div>
              <select 
                value={voiceOption} 
                onChange={(e) => setVoiceOption(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>Select voice</option>
                {voiceOptions.map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.icon} {voice.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-6 text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
        </div>

        {/* Selection Preview */}
        {canStart && (
          <div className="text-center text-white/70 text-sm">
            Ready to start with {languages.find(l => l.value === language)?.label}, {devices.find(d => d.value === device)?.label} using {guidanceOptions.find(g => g.value === guidanceStyle)?.label} with {voiceOptions.find(v => v.value === voiceOption)?.label}
          </div>
        )}
      </div>
    </div>
  );
}