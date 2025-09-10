import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import { useEffect } from "react";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import HelpTooltip from "@/components/HelpTooltip";

interface WelcomeProps {
  onStartSession: (config: SessionConfig) => void;
  onGoToHome?: () => void;
}

interface SessionConfig {
  language: string;
  device: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  guidanceStyle: string;
  voiceOption: string;
}

export default function Welcome({ onStartSession, onGoToHome }: WelcomeProps) {
  const [language, setLanguage] = useState<string>("en");
  const [deviceType, setDeviceType] = useState<string>("vital-signs");
  const [deviceBrand, setDeviceBrand] = useState<string>("");
  const [deviceModel, setDeviceModel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [guidanceStyle, setGuidanceStyle] = useState<string>("direct");
  const [voiceOption, setVoiceOption] = useState<string>("female");
  const [collapsedBoxes, setCollapsedBoxes] = useState<Set<string>>(new Set(['device', 'language', 'guidance', 'voice']));
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hoveredGuidance, setHoveredGuidance] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);


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

  const deviceTypes = [
    { value: "vital-signs", label: "Vital Signs", icon: "❤️", description: "Temperature, blood pressure, pulse" },
    { value: "monitoring", label: "Monitoring", icon: "📊", description: "Glucose, oxygen saturation" },
    { value: "diagnostic", label: "Diagnostic", icon: "🔬", description: "ECG, stethoscope" },
  ];

  const deviceBrands = {
    "vital-signs": [
      { value: "omron", label: "Omron", icon: "🏥" },
      { value: "braun", label: "Braun", icon: "🌡️" },
      { value: "exergen", label: "Exergen", icon: "🤒" },
      { value: "generic", label: "Generic/Other", icon: "📱" },
    ],
    "monitoring": [
      { value: "accu-chek", label: "Accu-Chek", icon: "🍬" },
      { value: "freestyle", label: "FreeStyle", icon: "💉" },
      { value: "contour", label: "Contour", icon: "🩸" },
      { value: "generic", label: "Generic/Other", icon: "📱" },
    ],
    "diagnostic": [
      { value: "philips", label: "Philips", icon: "🔬" },
      { value: "ge", label: "GE Healthcare", icon: "🏥" },
      { value: "generic", label: "Generic/Other", icon: "📱" },
    ],
  };

  const deviceModels = {
    "vital-signs": {
      "thermometer": {
        "omron": [
          { value: "mc-246", label: "MC-246 Digital Thermometer" },
          { value: "mc-245", label: "MC-245 Digital Thermometer" },
          { value: "mc-244", label: "MC-244 Digital Thermometer" },
        ],
        "braun": [
          { value: "thermoscan-7", label: "ThermoScan 7" },
          { value: "thermoscan-5", label: "ThermoScan 5" },
          { value: "thermoscan-3", label: "ThermoScan 3" },
        ],
        "exergen": [
          { value: "temporal-artery", label: "Temporal Artery Thermometer" },
          { value: "temporal-scanner", label: "Temporal Scanner" },
        ],
        "generic": [
          { value: "digital-oral", label: "Digital Oral Thermometer" },
          { value: "digital-rectal", label: "Digital Rectal Thermometer" },
          { value: "digital-axillary", label: "Digital Axillary Thermometer" },
        ],
      },
      "blood-pressure": {
        "omron": [
          { value: "m7", label: "M7 Intelli IT" },
          { value: "m10", label: "M10 Intelli IT" },
          { value: "m3", label: "M3 Intelli IT" },
        ],
        "generic": [
          { value: "digital-upper-arm", label: "Digital Upper Arm Monitor" },
          { value: "digital-wrist", label: "Digital Wrist Monitor" },
        ],
      },
    },
    "monitoring": {
      "glucose": {
        "accu-chek": [
          { value: "performa", label: "Accu-Chek Performa" },
          { value: "guide", label: "Accu-Chek Guide" },
        ],
        "freestyle": [
          { value: "freedom-lite", label: "FreeStyle Freedom Lite" },
          { value: "neo", label: "FreeStyle Neo" },
        ],
        "generic": [
          { value: "digital-glucose", label: "Digital Glucose Meter" },
        ],
      },
    },
  };

  const devices = [
    { value: "thermometer", label: "Digital thermometer", icon: "🌡️", enabled: true, type: "vital-signs" },
    { value: "ear", label: "Ear thermometer", icon: "👂", enabled: true, type: "vital-signs" },
    { value: "forehead", label: "Forehead thermometer", icon: "🤒", enabled: true, type: "vital-signs" },
    { value: "blood-pressure", label: "Blood pressure monitor", icon: "🩸", enabled: true, type: "vital-signs" },
    { value: "glucose", label: "Blood glucose meter", icon: "🍬", enabled: true, type: "monitoring" },
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

  // Check if user is first-time visitor
  useEffect(() => {
    const hasSeenTutorialBefore = localStorage.getItem('simis-ai-tutorial-seen');
    if (!hasSeenTutorialBefore) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('simis-ai-tutorial-seen', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    localStorage.setItem('simis-ai-tutorial-seen', 'true');
  };

  // Get available devices based on device type
  const getAvailableDevices = () => {
    if (!deviceType) return [];
    return devices.filter(device => device.type === deviceType);
  };

  // Get available brands based on device type
  const getAvailableBrands = () => {
    if (!deviceType) return [];
    return deviceBrands[deviceType] || [];
  };

  // Get available models based on device type, brand, and search query
  const getAvailableModels = () => {
    if (!deviceType || !deviceBrand) return [];
    
    const deviceTypeModels = deviceModels[deviceType];
    if (!deviceTypeModels) return [];
    
    // Find the device category (thermometer, blood-pressure, etc.)
    const deviceCategory = getAvailableDevices().find(d => d.type === deviceType)?.value;
    if (!deviceCategory || !deviceTypeModels[deviceCategory]) return [];
    
    const brandModels = deviceTypeModels[deviceCategory][deviceBrand] || [];
    
    if (!searchQuery) return brandModels;
    
    return brandModels.filter(model => 
      model.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get device name from type and model
  const getDeviceName = () => {
    if (!deviceType || !deviceBrand || !deviceModel) return '';
    const deviceCategory = getAvailableDevices().find(d => d.type === deviceType)?.value;
    return deviceCategory || '';
  };

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
      case 'deviceType':
        return deviceTypes.find(t => t.value === value)?.label || 'Select Device Type';
      case 'deviceBrand':
        return getAvailableBrands().find(b => b.value === value)?.label || 'Select Brand';
      case 'deviceModel':
        return getAvailableModels().find(m => m.value === value)?.label || 'Select Model';
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
        device: getDeviceName(),
        deviceType,
        deviceBrand,
        deviceModel,
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
          <h1 
            id="welcome-title"
            data-tutorial="welcome-title"
            className="text-5xl font-bold mb-6"
          >
            Welcome to <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SIMIS AI</span>
          </h1>
          <p className="text-white/70 text-lg mb-4">Your AI-powered medical device guidance assistant</p>
        </div>
      </div>

      {/* Configuration Container */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-6xl border border-border rounded-3xl px-12 py-20 mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Configure session</h2>
          
          {/* Device Configuration Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Icon icon="mingcute:device-line" className="w-6 h-6 mr-2" />
              Select your device
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Device Type Selection */}
              <Card 
                data-tutorial="device-type-card"
                className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
              >
                <CardContent className="px-6 py-3">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    data-option-box="deviceType"
                    onClick={() => togglePopover('deviceType')}
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:category-line" className="w-7 h-7 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{getDisplayLabel('deviceType', deviceType)}</p>
                    </div>
                    <div className="text-white/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Device Type Popover */}
                  {openPopover === 'deviceType' && (
                    <div 
                      className="absolute z-[100] mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                      data-popover="deviceType"
                    >
                      <div className="relative">
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-0.5">
                            {deviceTypes.map((type) => (
                              <div 
                                key={type.value} 
                                className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                  type.value === deviceType 
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                    : 'hover:bg-white/10 text-white'
                                }`}
                                onClick={() => {
                                  setDeviceType(type.value);
                                  setDeviceBrand('');
                                  setDeviceModel('');
                                  setSearchQuery('');
                                  setOpenPopover(null);
                                }}
                              >
                                <span className="text-lg">{type.icon}</span>
                                <div className="flex-1">
                                  <span className="block">{type.label}</span>
                                  <span className="text-xs text-white/60">{type.description}</span>
                                </div>
                                {type.value === deviceType && (
                                  <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Brand Selection */}
              <Card 
                data-tutorial="device-brand-card"
                className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
              >
                <CardContent className="px-6 py-3">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    data-option-box="deviceBrand"
                    onClick={() => deviceType && togglePopover('deviceBrand')}
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:building-line" className="w-7 h-7 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{getDisplayLabel('deviceBrand', deviceBrand)}</p>
                    </div>
                    <div className="text-white/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Device Brand Popover */}
                  {openPopover === 'deviceBrand' && deviceType && (
                    <div 
                      className="absolute z-[100] mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                      data-popover="deviceBrand"
                    >
                      <div className="relative">
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-0.5">
                            {getAvailableBrands().map((brand) => (
                              <div 
                                key={brand.value} 
                                className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                  brand.value === deviceBrand 
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                    : 'hover:bg-white/10 text-white'
                                }`}
                                onClick={() => {
                                  setDeviceBrand(brand.value);
                                  setDeviceModel('');
                                  setSearchQuery('');
                                  setOpenPopover(null);
                                }}
                              >
                                <span className="text-lg">{brand.icon}</span>
                                <span className="flex-1">{brand.label}</span>
                                {brand.value === deviceBrand && (
                                  <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Model Selection with Search */}
              <Card 
                data-tutorial="device-model-card"
                className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
              >
                <CardContent className="px-6 py-3">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    data-option-box="deviceModel"
                    onClick={() => deviceType && deviceBrand && togglePopover('deviceModel')}
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:settings-3-line" className="w-7 h-7 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{getDisplayLabel('deviceModel', deviceModel)}</p>
                    </div>
                    <div className="text-white/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Device Model Popover with Search */}
                  {openPopover === 'deviceModel' && deviceType && deviceBrand && (
                    <div 
                      className="absolute z-[100] mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                      data-popover="deviceModel"
                    >
                      <div className="relative">
                        {/* Search Input */}
                        <div className="p-4 border-b border-border">
                          <div className="relative">
                            <Icon icon="mingcute:search-line" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              placeholder="Search models..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-0.5">
                            {getAvailableModels().length > 0 ? (
                              getAvailableModels().map((model) => (
                                <div 
                                  key={model.value} 
                                  className={`flex items-center space-x-3 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                    model.value === deviceModel 
                                      ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                      : 'hover:bg-white/10 text-white'
                                  }`}
                                  onClick={() => {
                                    setDeviceModel(model.value);
                                    setOpenPopover(null);
                                  }}
                                >
                                  <span className="text-lg">📱</span>
                                  <span className="flex-1 text-sm">{model.label}</span>
                                  {model.value === deviceModel && (
                                    <Icon icon="mingcute:check-line" className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-white/50 text-sm">
                                {searchQuery ? 'No models found matching your search' : 'No models available'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Configuration Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Icon icon="mingcute:robot-line" className="w-6 h-6 mr-2" />
              Set SIMIS AI preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Language Selection */}
              <Card 
                data-tutorial="language-card"
                className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
              >
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
                    className="absolute z-[100] mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
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
            <Card 
              data-tutorial="guidance-card"
              className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
            >
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
                    className="absolute z-[100] mt-6 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
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
            <Card 
              data-tutorial="voice-card"
              className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative"
            >
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
                data-tutorial="start-button"
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

          {/* How It Works Modal - Simplified */}
          {showHowItWorks && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowHowItWorks(false)}
            >
              <div 
                className="bg-background border border-border rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">How SIMIS AI Works</h2>
                  <p className="text-white/70 text-sm mb-6">
                    SIMIS AI uses real-time camera detection to identify your medical device and provides step-by-step guidance in your preferred language with voice assistance.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => window.open('/how-it-works', '_blank')}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      Learn More
                      <Icon icon="mingcute:external-link-line" className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => setShowHowItWorks(false)}
                      variant="outline"
                      className="w-full bg-transparent text-white border-border hover:border-white/60"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Tutorial */}
          <OnboardingTutorial
            isVisible={showTutorial}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
          />
        </div>
      </div>
    </div>
  );
}