import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useEffect } from "react";
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

export default function Welcome({ onStartSession, onGoToHome }: WelcomeProps) {
  const [language, setLanguage] = useState<string>("en");
  const [device, setDevice] = useState<string>("thermometer");
  const [guidanceStyle, setGuidanceStyle] = useState<string>("direct");
  const [voiceOption, setVoiceOption] = useState<string>("female");
  const [collapsedBoxes, setCollapsedBoxes] = useState<Set<string>>(new Set(['device', 'language', 'guidance', 'voice']));
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hoveredGuidance, setHoveredGuidance] = useState<string | null>(null);

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
    { value: "direct", label: "Direct instructions", icon: "📋", description: "Clear, step-by-step commands for immediate action" },
    { value: "gentle", label: "Gentle suggestions", icon: "💡", description: "Soft, encouraging guidance with helpful tips" },
    { value: "detailed", label: "Detailed explanations", icon: "📖", description: "Comprehensive information with context and reasoning" },
  ];

  const voiceOptions = [
    { value: "male", label: "Male", icon: "👨" },
    { value: "female", label: "Female", icon: "👩" },
    { value: "text", label: "Text only", icon: "📝" },
  ];

  const canStart = true;

  const toggleBox = (boxType: string) => {
    const newCollapsed = new Set(collapsedBoxes);
    if (newCollapsed.has(boxType)) {
      newCollapsed.delete(boxType);
    } else {
      newCollapsed.add(boxType);
    }
    setCollapsedBoxes(newCollapsed);
  };

  const togglePopover = (popoverType: string) => {
    console.log('togglePopover called with:', popoverType);
    console.log('Current openPopover state:', openPopover);
    
    // If clicking the same popover type that's already open, close it
    if (openPopover === popoverType) {
      console.log('Closing popover:', popoverType);
      setOpenPopover(null);
    } else {
      // If clicking a different popover type or opening a closed one, open it
      console.log('Opening popover:', popoverType);
      setOpenPopover(popoverType);
    }
  };

  const getDisplayLabel = (type: string, value: string) => {
    switch (type) {
      case 'language':
        return languages.find(l => l.value === value)?.label.replace(/^[^\s]+ /, '') || '';
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

  const getLanguageDisplayLabel = (value: string) => {
    const lang = languages.find(l => l.value === value);
    if (!lang) return '';
    return `${lang.flag} ${lang.label.replace(/^[^\s]+ /, '')}`;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      console.log('Click outside detected, target:', target);
      console.log('Current openPopover before click outside:', openPopover);
      
      // Only handle click outside if there's an open popover
      if (openPopover) {
        // Check if the click is on an option box (which should toggle the popover)
        const isOptionBoxClick = (target as Element).closest?.('[data-option-box]');
        if (isOptionBoxClick) {
          console.log('Click is on option box, not closing popover');
          return; // Don't close if clicking on option box
        }
        
        const popoverElement = document.querySelector(`[data-popover="${openPopover}"]`);
        if (popoverElement && !popoverElement.contains(target)) {
          console.log('Closing popover due to click outside');
          setOpenPopover(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopover]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81] flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="flex justify-center pt-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SIMIS AI</span>
          </h1>
          <p className="text-white/70 text-lg mb-4">Your AI-powered medical device guidance assistant</p>
        </div>
      </div>

      {/* Configuration Container */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-6xl border border-border rounded-3xl px-12 py-20 mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Configure session</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
            {/* Device Selection */}
            <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
              <CardContent className="px-6 py-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  data-option-box="device"
                  onClick={() => {
                    console.log('Device option box clicked');
                    console.log('Current openPopover:', openPopover);
                    togglePopover('device');
                  }}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:cellphone-vibration-line" className="w-7 h-7 text-white/70" />
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

                {/* Device Popover */}
                {openPopover === 'device' && (
                  <div 
                    className="absolute z-50 mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                    data-popover="device"
                  >
                    <div className="relative">
                      <div className="p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {devices.map((dev) => (
                            <div 
                              key={dev.value} 
                              className={`flex items-center space-x-3 p-1.5 rounded-lg transition-colors ${
                                dev.value === device 
                                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                  : dev.enabled 
                                    ? 'hover:bg-white/10 text-white cursor-pointer' 
                                    : 'text-white/50 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (dev.enabled) {
                                  console.log('Device selected:', dev.value);
                                  console.log('Current openPopover before selection:', openPopover);
                                  setDevice(dev.value);
                                  setOpenPopover(null);
                                  console.log('Popover closed after device selection');
                                }
                              }}
                            >
                              <span className="text-lg">{dev.icon}</span>
                              <span className="flex-1">{dev.label}</span>
                              {dev.value === device && (
                                <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scroll indicator - fixed at bottom of popover */}
                      {devices.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-8 flex items-end justify-center pb-1 pointer-events-none">
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white/30"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Language Selection */}
            <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
              <CardContent className="px-6 py-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  data-option-box="language"
                  onClick={() => {
                    console.log('Language option box clicked');
                    console.log('Current openPopover:', openPopover);
                    togglePopover('language');
                  }}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:world-2-line" className="w-7 h-7 text-white/80" />
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

                {/* Language Popover */}
                {openPopover === 'language' && (
                  <div 
                    className="absolute z-50 mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                    data-popover="language"
                  >
                    <div className="relative">
                      <div className="p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {languages.map((lang) => (
                            <div 
                              key={lang.value} 
                              className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                lang.value === language 
                                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                  : 'hover:bg-white/10 text-white'
                              }`}
                              onClick={() => {
                                console.log('Language selected:', lang.value);
                                console.log('Current openPopover before selection:', openPopover);
                                setLanguage(lang.value);
                                setOpenPopover(null);
                                console.log('Popover closed after language selection');
                              }}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span className="flex-1">{lang.label.replace(/^[^\s]+ /, '')}</span>
                              {lang.value === language && (
                                <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scroll indicator - fixed at bottom of popover */}
                      {languages.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-8 flex items-end justify-center pb-1 pointer-events-none">
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white/30"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guidance Style */}
            <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
              <CardContent className="px-6 py-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  data-option-box="guidance"
                  onClick={() => {
                    console.log('Guidance option box clicked');
                    console.log('Current openPopover:', openPopover);
                    togglePopover('guidance');
                  }}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:settings-1-line" className="w-7 h-7 text-white/80" />
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

                {/* Guidance Popover */}
                {openPopover === 'guidance' && (
                  <div 
                    className="absolute z-50 mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                    data-popover="guidance"
                  >
                    <div className="relative">
                      <div className="p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {guidanceOptions.map((style) => (
                            <div 
                              key={style.value} 
                              className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors relative ${
                                style.value === guidanceStyle 
                                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                  : 'hover:bg-white/10 text-white'
                              }`}
                              onClick={() => {
                                console.log('Guidance selected:', style.value);
                                console.log('Current openPopover before selection:', openPopover);
                                setGuidanceStyle(style.value);
                                setOpenPopover(null);
                                console.log('Popover closed after guidance selection');
                              }}
                              onMouseEnter={() => setHoveredGuidance(style.value)}
                              onMouseLeave={() => setHoveredGuidance(null)}
                            >
                              <span className="text-lg">{style.icon}</span>
                              <span className="flex-1">{style.label}</span>
                              {style.value === guidanceStyle && (
                                <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                              )}
                              
                              {/* Hover Tooltip */}
                              {hoveredGuidance === style.value && (
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-64 bg-background border border-border rounded-lg p-3 shadow-lg z-50">
                                  <p className="text-white/80 text-sm">{style.description}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scroll indicator - fixed at bottom of popover */}
                      {guidanceOptions.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-8 flex items-end justify-center pb-1 pointer-events-none">
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white/30"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Options */}
            <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
              <CardContent className="px-6 py-3">
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  data-option-box="voice"
                  onClick={() => {
                    console.log('Voice option box clicked');
                    console.log('Current openPopover:', openPopover);
                    togglePopover('voice');
                  }}
                >
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon icon="mingcute:mic-ai-line" className="w-7 h-7 text-white/80" />
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

                {/* Voice Popover */}
                {openPopover === 'voice' && (
                  <div className="absolute z-50 mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
                    <div className="relative">
                      <div className="p-4 max-h-48 overflow-y-auto">
                        <div className="space-y-0.5">
                          {voiceOptions.map((voice) => (
                            <div 
                              key={voice.value} 
                              className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                voice.value === voiceOption 
                                  ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                  : 'hover:bg-white/10 text-white'
                              }`}
                              onClick={() => {
                                console.log('Voice selected:', voice.value);
                                console.log('Current openPopover before selection:', openPopover);
                                setVoiceOption(voice.value);
                                setOpenPopover(null);
                                console.log('Popover closed after voice selection');
                              }}
                            >
                              <span className="text-lg">{voice.icon}</span>
                              <span className="flex-1">{voice.label}</span>
                              {voice.value === voiceOption && (
                                <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scroll indicator - fixed at bottom of popover */}
                      {voiceOptions.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent h-8 flex items-end justify-center pb-1 pointer-events-none">
                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white/30"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Start Button */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-8">
              <Button
                onClick={() => setShowHowItWorks(true)}
                variant="outline"
                size="lg"
                className="bg-transparent text-white font-semibold px-6 py-3 text-md rounded-xl border border-border hover:border-white/60 transition-all duration-300"
              >
                How It Works
              </Button>
              
              <Button
                onClick={handleStart}
                disabled={!canStart}
                size="lg"
                className="bg-primary hover:bg-white text-white hover:text-primary font-semibold px-6 py-3 text-md rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 border border-primary hover:border-white items-center"
              >
                Start
                <Icon icon="mingcute:play-fill" className="w-8 h-8 ml-1" />
              </Button>
            </div>
          </div>

          {/* How It Works Modal */}
          {showHowItWorks && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowHowItWorks(false)}
            >
              <div 
                className="bg-background border border-border rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative mb-6">
                  <h2 className="text-4xl font-bold text-white text-center">How SIMIS AI Works</h2>
                  <Button
                    onClick={() => setShowHowItWorks(false)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 text-white hover:bg-white/10 flex-shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
                
                <p className="text-white/70 text-sm text-center max-w-2xl mx-auto mb-6">
                  Real-time camera detection identifies your thermometer, while our AI provides step-by-step guidance in your preferred language with voice assistance.
                </p>
                
                <img 
                  src={simulationImage} 
                  alt="SIMIS AI Interface Preview - Split screen showing thermometer detection with camera view and step-by-step guidance"
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}