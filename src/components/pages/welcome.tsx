import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Icon } from "@iconify/react";
import deviceOptions from "../../data/device-options.json";
import preferenceOptions from "../../data/preference-options.json";

interface WelcomeProps {
  onStartSession: (config: SessionConfig) => void;
  onGoToHome?: () => void;
  initialAdvancedMode?: boolean;
  onAdvancedModeChange?: (isAdvanced: boolean) => void;
}

interface SessionConfig {
  language: string;
  device: string;
  guidanceStyle: string;
  voiceOption: string;
}

export default function Welcome({ onStartSession, onGoToHome, initialAdvancedMode = false, onAdvancedModeChange }: WelcomeProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [showAdvancedView, setShowAdvancedView] = useState<boolean>(false);
  const [showSmartDefaults, setShowSmartDefaults] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [modalDeviceInfo, setModalDeviceInfo] = useState<{type: string, label: string} | null>(null);
  const [howItWorksSource, setHowItWorksSource] = useState<'welcome' | 'smart-defaults' | null>(null);
  
  // Advanced view states (only used when advanced view is enabled)
  const [language, setLanguage] = useState<string>("en");
  const [device, setDevice] = useState<string>("oral-thermometer");
  const [guidanceStyle, setGuidanceStyle] = useState<string>("direct");
  const [voiceOption, setVoiceOption] = useState<string>("female");
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hoveredGuidance, setHoveredGuidance] = useState<string | null>(null);


  // Load options from JSON files
  const languages = preferenceOptions.languages;
  const devices = deviceOptions.deviceTypes;
  const guidanceOptions = preferenceOptions.guidanceOptions;
  const voiceOptions = preferenceOptions.voiceOptions;

  // Hackathon devices for quick selection
  const hackathonDevices = [
    { value: "oral-thermometer", label: "Oral Thermometer", icon: "🌡️", description: "Check your temperature orally" },
    { value: "ear-thermometer", label: "Ear Thermometer", icon: "👂", description: "Check your temperature via ear" },
    { value: "blood-pressure", label: "Blood Pressure Monitor", icon: "🩸", description: "Monitor your blood pressure" },
  ];

  // Auto-detect language from browser
  const autoDetectLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = languages.find(lang => lang.value === browserLang);
    return supportedLang ? browserLang : 'en';
  };




  // Toggle advanced view
  const toggleAdvancedView = () => {
    setShowAdvancedView(!showAdvancedView);
    localStorage.setItem('simis-advanced-view', (!showAdvancedView).toString());
  };



  // Handle smart defaults start
  const handleSmartDefaultsStart = () => {
    const deviceType = modalDeviceInfo ? modalDeviceInfo.type : selectedDevice;
    const config: SessionConfig = {
      language: autoDetectLanguage(),
      device: deviceType,
      guidanceStyle: "gentle",
      voiceOption: "female"
    };
    setModalDeviceInfo(null); // Clear modal info
    onStartSession(config);
  };

  // Load user preferences on mount
  useEffect(() => {
    console.log('Welcome component mounted with initialAdvancedMode:', initialAdvancedMode);
    // Only show advanced view if explicitly requested via initialAdvancedMode prop
    if (initialAdvancedMode === true) {
      console.log('Setting advanced view to true');
      setShowAdvancedView(true);
    } else {
      console.log('Setting advanced view to false');
      // Ensure advanced view is false by default
      setShowAdvancedView(false);
    }
  }, [initialAdvancedMode]);

  const canStart = true;

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

  // Track advanced mode changes and notify parent
  useEffect(() => {
    if (onAdvancedModeChange) {
      onAdvancedModeChange(showAdvancedView);
    }
  }, [showAdvancedView, onAdvancedModeChange]);

  // Smart Defaults Screen - Now as a modal overlay with editable settings
  if (showSmartDefaults) {
    const selectedDeviceData = modalDeviceInfo ? 
      { label: modalDeviceInfo.label } : 
      hackathonDevices.find(d => d.value === selectedDevice);
    
    // Create display text for the device
    const getDeviceDisplayText = () => {
      if (modalDeviceInfo) {
        if (modalDeviceInfo.brand && modalDeviceInfo.model) {
          return `${modalDeviceInfo.brand} ${modalDeviceInfo.model}`;
        } else if (modalDeviceInfo.brand) {
          return `${modalDeviceInfo.brand} ${modalDeviceInfo.label}`;
        } else {
          return modalDeviceInfo.label;
        }
      }
      return selectedDeviceData?.label || 'device';
    };
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-primary/10 border border-primary/30 rounded-2xl p-6 mx-auto shadow-2xl backdrop-blur-md relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Ready to guide you through using your <span className="text-primary">{getDeviceDisplayText()}</span>
            </h1>
            <p className="text-white/70 text-sm">Customize your settings:</p>
          </div>

          <div className="space-y-3 mb-6">
            {/* Language Setting */}
            <div className="relative">
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors" onClick={() => setOpenPopover('language')}>
                <div>
                  <p className="text-white font-medium text-sm">Language</p>
                  <p className="text-white/70 text-xs">{languages.find(l => l.value === language)?.label}</p>
                </div>
                <Icon icon="mingcute:edit-line" className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
              </div>
              
              {/* Language Popover */}
              {openPopover === 'language' && (
                <div 
                  className="absolute z-[10001] mt-2 left-0 w-full bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                  data-popover="language"
                >
                  <div className="relative">
                    <div className="p-3 max-h-40 overflow-y-auto">
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
                              setLanguage(lang.value);
                              setOpenPopover(null);
                            }}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="flex-1 text-sm">{lang.label.replace(/^[^\s]+ /, '')}</span>
                            {lang.value === language && (
                              <Icon icon="mingcute:check-line" className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Voice Setting */}
            <div className="relative">
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors" onClick={() => setOpenPopover('voice')}>
                <div>
                  <p className="text-white font-medium text-sm">Voice</p>
                  <p className="text-white/70 text-xs">{voiceOptions.find(v => v.value === voiceOption)?.label}</p>
                </div>
                <Icon icon="mingcute:edit-line" className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
              </div>
              
              {/* Voice Popover */}
              {openPopover === 'voice' && (
                <div 
                  className="absolute z-[10001] mt-2 left-0 w-full bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                  data-popover="voice"
                >
                  <div className="relative">
                    <div className="p-3 max-h-40 overflow-y-auto">
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
                              setVoiceOption(voice.value);
                              setOpenPopover(null);
                            }}
                          >
                            <span className="text-lg">{voice.icon}</span>
                            <span className="flex-1 text-sm">{voice.label}</span>
                            {voice.value === voiceOption && (
                              <Icon icon="mingcute:check-line" className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Style Setting */}
            <div className="relative">
              <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors" onClick={() => setOpenPopover('style')}>
                <div>
                  <p className="text-white font-medium text-sm">Style</p>
                  <p className="text-white/70 text-xs">{guidanceOptions.find(g => g.value === guidanceStyle)?.label}</p>
                </div>
                <Icon icon="mingcute:edit-line" className="w-4 h-4 text-white/50 hover:text-white transition-colors" />
              </div>
              
              {/* Style Popover */}
              {openPopover === 'style' && (
                <div 
                  className="absolute z-[10001] mt-2 left-0 w-full bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                  data-popover="style"
                >
                  <div className="relative">
                    <div className="p-3 max-h-40 overflow-y-auto">
                      <div className="space-y-0.5">
                        {guidanceOptions.map((style) => (
                          <div 
                            key={style.value} 
                            className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                              style.value === guidanceStyle 
                                ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                : 'hover:bg-white/10 text-white'
                            }`}
                            onClick={() => {
                              setGuidanceStyle(style.value);
                              setOpenPopover(null);
                            }}
                          >
                            <span className="text-lg">{style.icon}</span>
                            <span className="flex-1 text-sm">{style.label}</span>
                            {style.value === guidanceStyle && (
                              <Icon icon="mingcute:check-line" className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-white/60 text-center text-xs mb-6">Perfect for most people</p>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowSmartDefaults(false);
                setModalDeviceInfo(null);
              }}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                setHowItWorksSource('smart-defaults');
                setShowSmartDefaults(false);
                setShowHowItWorks(true);
              }}
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              How it works
            </Button>
            <Button
              onClick={handleSmartDefaultsStart}
              variant="default"
              size="sm"
              className="flex-1 text-xs"
            >
              Start
              <Icon icon="mingcute:play-fill" className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#312E81] flex flex-col items-center justify-center">
      {/* Hero Section */}
      <div className="flex justify-center pt-16">
        <div className="text-center">
          <h1 id="welcome-title" data-tutorial="welcome-title" className="text-5xl font-bold mb-6">
            Welcome to <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SIMIS</span>
          </h1>
          <p className="text-white/70 text-lg mb-4">Your AI-powered medical device guidance assistant</p>
        </div>
      </div>

      {/* Main Device Selection Container */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-6xl border border-border rounded-3xl px-12 py-20 mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What device do you need help with?</h2>
          


          {/* Hackathon Devices */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">Select Your Device</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hackathonDevices.map((device) => (
                <Card 
                  key={device.value}
                  className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 cursor-pointer device-tile"
                  onClick={() => {
                    setModalDeviceInfo({ type: device.value, label: device.label });
                    setShowSmartDefaults(true);
                  }}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{device.icon}</div>
                    <h4 className="text-white font-semibold mb-3 text-lg">{device.label}</h4>
                    <p className="text-white/70 text-sm">{device.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


          {/* Advanced View Toggle */}
          {!showAdvancedView && (
            <div className="text-center">
              <button
                onClick={toggleAdvancedView}
                className="text-white/60 hover:text-white/80 text-sm underline toggle-link"
              >
                Need more control? Advanced setup
              </button>
            </div>
          )}

          {/* Advanced View - Show all original dropdowns */}
          {showAdvancedView && (
            <div className="mt-16">
              {/* Divider */}
              <div className="flex items-center mb-8">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold rounded-full">
                  EXPERT MODE
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-semibold text-white">Advanced Setup</h3>
                <button
                  onClick={() => setShowAdvancedView(false)}
                  className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40"
                >
                  <Icon icon="mingcute:arrow-left-line" className="w-4 h-4" />
                  Back to Simple
                </button>
              </div>
              
              {/* Device Selection Section */}
              <div className="mb-12 relative z-20">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-4">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                  Select your device
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hackathonDevices.map((deviceOption) => (
                    <Card 
                      key={deviceOption.value}
                      className={`bg-card/50 border-border backdrop-blur-sm transition-all duration-300 cursor-pointer ${
                        device === deviceOption.value 
                          ? 'ring-2 ring-primary bg-primary/10' 
                          : 'hover:bg-card/70'
                      }`}
                      onClick={() => setDevice(deviceOption.value)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{deviceOption.icon}</div>
                        <h4 className="text-white font-semibold mb-2">{deviceOption.label}</h4>
                        <p className="text-white/70 text-sm">{deviceOption.description}</p>
                        {device === deviceOption.value && (
                          <div className="mt-3">
                            <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary mx-auto" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

          {/* AI Preferences Section */}
                <div className="mb-8 relative z-10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-4">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                  Set preferences
                </h4>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

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
                    className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
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
                    className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
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
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 w-64 bg-background border border-border rounded-lg p-3 shadow-lg z-[10002]">
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
                  <div className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden">
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
          </div>

          {/* Start Button */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-8">
              <Button
                onClick={() => {
                  setHowItWorksSource('welcome');
                  setShowHowItWorks(true);
                }}
                variant="outline"
                size="lg"
                  className="font-semibold text-base hover:bg-white/10 hover:border-white/50"
              >
                  How it works
              </Button>
              
              <Button
                onClick={handleStart}
                disabled={!canStart}
                  variant="default"
                size="lg"
                  className="font-semibold text-base disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                Start
                <Icon icon="mingcute:play-fill" className="w-8 h-8 ml-1" />
              </Button>
            </div>
          </div>
          </div>
          )}

          {/* How it works Modal */}
          {showHowItWorks && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
              <div className="bg-background border border-border rounded-2xl p-8 max-w-2xl w-full">
                <h2 className="text-3xl font-bold text-white text-center mb-4">How SIMIS Works</h2>
                
                <p className="text-white/70 text-center max-w-xl mx-auto mb-8">
                  SIMIS uses real-time camera detection to identify your medical device and provides step-by-step guidance in your preferred language with voice assistance.
                </p>

                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => window.open('/how-it-works', '_blank')}
                    variant="outline"
                  >
                    Learn more
                    <Icon icon="mingcute:external-link-line" className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowHowItWorks(false);
                      if (howItWorksSource === 'smart-defaults') {
                        setShowSmartDefaults(true);
                      }
                      setHowItWorksSource(null);
                    }}
                    variant="default"
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>  );
}
