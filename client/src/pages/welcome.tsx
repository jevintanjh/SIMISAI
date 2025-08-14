import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import simulationImage from "@assets/generated_images/SIMIS_AI_thermometer_detection_interface_ddfe0475.png";

interface WelcomeProps {
  onStartSession: (config: SessionConfig) => void;
  onGoToHome?: () => void;
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
  const [collapsedBoxes, setCollapsedBoxes] = useState<Set<string>>(new Set());

  const languages = [
    { value: "en", label: "🇺🇸 English", flag: "🇺🇸" },
    { value: "id", label: "🇮🇩 Bahasa Indonesia", flag: "🇮🇩" },
    { value: "ms", label: "🇲🇾 Bahasa Melayu", flag: "🇲🇾" },
    { value: "th", label: "🇹🇭 ภาษาไทย", flag: "🇹🇭" },
    { value: "vi", label: "🇻🇳 Tiếng Việt", flag: "🇻🇳" },
    { value: "fil", label: "🇵🇭 Filipino", flag: "🇵🇭" },
    { value: "my", label: "🇲🇲 မြန်မာ", flag: "🇲🇲" },
    { value: "lo", label: "🇱🇦 ລາວ", flag: "🇱🇦" },
    { value: "km", label: "🇰🇭 ខ្មែរ", flag: "🇰🇭" },
    { value: "bn", label: "🇧🇳 Brunei Malay", flag: "🇧🇳" },
  ];

  const devices = [
    { value: "thermometer", label: "Digital thermometer", icon: "🌡️", enabled: true },
    { value: "ear", label: "Ear thermometer", icon: "👂", enabled: false },
    { value: "forehead", label: "Forehead thermometer", icon: "🤒", enabled: false },
    { value: "blood-pressure", label: "Blood pressure monitor", icon: "🩸", enabled: false },
    { value: "glucose", label: "Blood glucose meter", icon: "🍬", enabled: false },
  ];

  const guidanceOptions = [
    { value: "direct", label: "Direct instructions", icon: "📋" },
    { value: "gentle", label: "Gentle suggestions", icon: "💡" },
    { value: "detailed", label: "Detailed explanations", icon: "📖" },
  ];

  const voiceOptions = [
    { value: "male", label: "Male", icon: "👨" },
    { value: "female", label: "Female", icon: "👩" },
    { value: "text", label: "Text only", icon: "📝" },
  ];

  const canStart = language && device && guidanceStyle && voiceOption;

  const toggleBox = (boxType: string) => {
    const newCollapsed = new Set(collapsedBoxes);
    if (newCollapsed.has(boxType)) {
      newCollapsed.delete(boxType);
    } else {
      newCollapsed.add(boxType);
    }
    setCollapsedBoxes(newCollapsed);
  };

  const getDisplayLabel = (type: string, value: string) => {
    switch (type) {
      case 'language':
        return languages.find(l => l.value === value)?.label || '';
      case 'device':
        return devices.find(d => d.value === value)?.label || '';
      case 'guidance':
        return guidanceOptions.find(g => g.value === value)?.label || '';
      case 'voice':
        return voiceOptions.find(v => v.value === value)?.label || '';
      default:
        return '';
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/10 flex items-center justify-center p-4">
      {/* Main container with white border */}
      <div className="w-full max-w-8xl bg-background border border-white/10 rounded-3xl px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Welcome to SIMIS AI</h1>
          <p className="text-white/70 text-lg mb-8">Configure your medical device assistance session</p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary to-blue-400 mx-auto"></div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-8 text-center">Configure session</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-12">
          {/* Language Selection */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 lg:col-span-3">
            <CardContent className="p-6">
              {collapsedBoxes.has('language') ? (
                // Collapsed view - show selected language
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleBox('language')}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:world-2-line" className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{getDisplayLabel('language', language)}</p>
                  </div>
                  <div className="text-white/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Expanded view - show radio buttons
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:world-2-line" className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Language</h3>
                  </div>
                  <RadioGroup
                    value={language}
                    onValueChange={(value) => {
                      if (value === language) {
                        // If clicking on already selected option, collapse the box
                        toggleBox('language');
                      } else {
                        // If selecting a new option, update and collapse
                        setLanguage(value);
                        toggleBox('language');
                      }
                    }}
                    className="space-y-2"
                  >
                    {languages.map((lang) => (
                      <div key={lang.value} className="grid grid-cols-[auto_1fr] gap-3 items-center">
                        <RadioGroupItem 
                          value={lang.value} 
                          id={`lang-${lang.value}`}
                          className="border-white/20 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-1"
                        />
                        <Label 
                          htmlFor={`lang-${lang.value}`} 
                          className="text-sm text-white cursor-pointer hover:text-primary/80 transition-colors"
                          onClick={() => {
                            if (lang.value === language) {
                              toggleBox('language');
                            }
                          }}
                        >
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              )}
            </CardContent>
          </Card>

          {/* Device Selection */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 lg:col-span-3">
            <CardContent className="p-6">
              {collapsedBoxes.has('device') ? (
                // Collapsed view - show selected device
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleBox('device')}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:cellphone-vibration-fill" className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{getDisplayLabel('device', device)}</p>
                  </div>
                  <div className="text-white/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Expanded view - show radio buttons
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:cellphone-vibration-fill" className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Device</h3>
                  </div>
                  <RadioGroup
                    value={device}
                    onValueChange={(value) => {
                      const selectedDevice = devices.find(d => d.value === value);
                      if (selectedDevice?.enabled) {
                        setDevice(value);
                        toggleBox('device');
                      }
                    }}
                    className="space-y-2"
                  >
                    {devices.map((dev) => (
                      <div key={dev.value} className={`grid grid-cols-[auto_1fr] gap-3 items-center ${!dev.enabled ? 'opacity-50' : ''}`}>
                        <RadioGroupItem 
                          value={dev.value} 
                          id={`device-${dev.value}`}
                          disabled={!dev.enabled}
                          className={`border-white/20 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-1 ${
                            !dev.enabled ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        />
                        <Label 
                          htmlFor={`device-${dev.value}`} 
                          className={`text-sm text-white transition-colors ${
                            dev.enabled 
                              ? 'cursor-pointer hover:text-primary/80' 
                              : 'cursor-not-allowed text-white/50'
                          }`}
                          onClick={() => {
                            if (dev.enabled && dev.value === device) {
                              toggleBox('device');
                            }
                          }}
                        >
                          {dev.icon} {dev.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              )}
            </CardContent>
          </Card>

          {/* Guidance Style */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 lg:col-span-3">
            <CardContent className="p-6">
              {collapsedBoxes.has('guidance') ? (
                // Collapsed view - show selected guidance style
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleBox('guidance')}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:settings-5-fill" className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{getDisplayLabel('guidance', guidanceStyle)}</p>
                  </div>
                  <div className="text-white/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Expanded view - show radio buttons
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:settings-5-fill" className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Guidance</h3>
                  </div>
                  <RadioGroup
                    value={guidanceStyle}
                    onValueChange={(value) => {
                      if (value === guidanceStyle) {
                        // If clicking on already selected option, collapse the box
                        toggleBox('guidance');
                      } else {
                        // If selecting a new option, update and collapse
                        setGuidanceStyle(value);
                        toggleBox('guidance');
                      }
                    }}
                    className="space-y-2"
                  >
                    {guidanceOptions.map((style) => (
                      <div key={style.value} className="grid grid-cols-[auto_1fr] gap-3 items-center">
                        <RadioGroupItem 
                          value={style.value} 
                          id={`guidance-${style.value}`}
                          className="border-white/20 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-1"
                        />
                        <Label 
                          htmlFor={`guidance-${style.value}`} 
                          className="text-sm text-white cursor-pointer hover:text-primary/80 transition-colors"
                          onClick={() => {
                            if (style.value === guidanceStyle) {
                              toggleBox('guidance');
                            }
                          }}
                        >
                          {style.icon} {style.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              )}
            </CardContent>
          </Card>

          {/* Voice Options */}
          <Card className="bg-card/50 border-white/20 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 lg:col-span-3">
            <CardContent className="p-6">
              {collapsedBoxes.has('voice') ? (
                // Collapsed view - show selected voice option
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleBox('voice')}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:mic-line" className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{getDisplayLabel('voice', voiceOption)}</p>
                  </div>
                  <div className="text-white/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                // Expanded view - show radio buttons
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:mic-line" className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Voice</h3>
                  </div>
                  <RadioGroup
                    value={voiceOption}
                    onValueChange={(value) => {
                      if (value === voiceOption) {
                        // If clicking on already selected option, collapse the box
                        toggleBox('voice');
                      } else {
                        // If selecting a new option, update and collapse
                        setVoiceOption(value);
                        toggleBox('voice');
                      }
                    }}
                    className="space-y-2"
                  >
                    {voiceOptions.map((voice) => (
                      <div key={voice.value} className="grid grid-cols-[auto_1fr] gap-3 items-center">
                        <RadioGroupItem 
                          value={voice.value} 
                          id={`voice-${voice.value}`}
                          className="border-white/20 text-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary ml-1"
                        />
                        <Label 
                          htmlFor={`voice-${voice.value}`} 
                          className="text-sm text-white cursor-pointer hover:text-primary/80 transition-colors"
                          onClick={() => {
                            if (voice.value === voiceOption) {
                              toggleBox('voice');
                            }
                          }}
                        >
                          {voice.icon} {voice.label}
                        </Label>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Start Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className="bg-white hover:bg-gray-100 text-background font-semibold px-12 py-4 text-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 border-2 border-white/20"
          >
            <Icon icon="mingcute:play-fill" className="w-7 h-7 mr-3 text-background" />
            Start Session
          </Button>
        </div>

        {/* How It Works Preview */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">How SIMIS AI Works</h3>
          <div className="bg-card/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <img 
              src={simulationImage} 
              alt="SIMIS AI Interface Preview - Split screen showing thermometer detection with camera view and step-by-step guidance"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
            />
            <p className="text-white/70 text-sm mt-4 max-w-2xl mx-auto">
              Real-time camera detection identifies your thermometer, while our AI provides step-by-step guidance in your preferred language with voice assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}