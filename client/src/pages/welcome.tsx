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
    { value: "thermometer", label: "Digital thermometer", icon: "🌡️" },
    { value: "infrared", label: "Infrared thermometer", icon: "📡" },
    { value: "blood-pressure", label: "Blood pressure monitor", icon: "🩺" },
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
      <div className="w-full max-w-6xl bg-background border border-white/10 rounded-3xl p-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Welcome to SIMIS AI</h1>
          <p className="text-white/70 text-lg mb-8">Configure your medical device assistance session</p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary to-blue-400 mx-auto"></div>
        </div>

        <div className="grid grid-cols-4 gap-8 mb-12">
          {/* Language Selection */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-center mb-2">Language</h3>
              <p className="text-white/60 text-sm text-center mb-4">Select your preferred language</p>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-input/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
              >
                <option value="" disabled className="text-gray-500">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-gray-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Device Selection */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-center mb-2">Device</h3>
              <p className="text-white/60 text-sm text-center mb-4">Choose medical device type</p>
              <select 
                value={device} 
                onChange={(e) => setDevice(e.target.value)}
                className="w-full bg-input/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
              >
                <option value="" disabled className="text-gray-500">Select device</option>
                {devices.map((dev) => (
                  <option key={dev.value} value={dev.value} className="bg-gray-900 text-white">
                    {dev.icon} {dev.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Guidance Style */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-center mb-2">Guidance</h3>
              <p className="text-white/60 text-sm text-center mb-4">Select instruction style</p>
              <select 
                value={guidanceStyle} 
                onChange={(e) => setGuidanceStyle(e.target.value)}
                className="w-full bg-input/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
              >
                <option value="" disabled className="text-gray-500">Select style</option>
                {guidanceOptions.map((style) => (
                  <option key={style.value} value={style.value} className="bg-gray-900 text-white">
                    {style.icon} {style.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Voice Options */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6 justify-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-white text-center mb-2">Voice</h3>
              <p className="text-white/60 text-sm text-center mb-4">Audio assistance option</p>
              <select 
                value={voiceOption} 
                onChange={(e) => setVoiceOption(e.target.value)}
                className="w-full bg-input/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
              >
                <option value="" disabled className="text-gray-500">Select voice</option>
                {voiceOptions.map((voice) => (
                  <option key={voice.value} value={voice.value} className="bg-gray-900 text-white">
                    {voice.icon} {voice.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold px-12 py-4 text-xl rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Session
          </Button>
        </div>

        {/* Selection Preview */}
        {canStart && (
          <div className="text-center">
            <div className="bg-card/30 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-sm">
              <h4 className="text-white font-medium mb-3">Session Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-white/70">
                  <span className="font-medium text-primary">Language:</span> {languages.find(l => l.value === language)?.label}
                </div>
                <div className="text-white/70">
                  <span className="font-medium text-primary">Device:</span> {devices.find(d => d.value === device)?.label}
                </div>
                <div className="text-white/70">
                  <span className="font-medium text-primary">Guidance:</span> {guidanceOptions.find(g => g.value === guidanceStyle)?.label}
                </div>
                <div className="text-white/70">
                  <span className="font-medium text-primary">Voice:</span> {voiceOptions.find(v => v.value === voiceOption)?.label}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}