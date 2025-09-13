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
  deviceBrand: string;
  deviceModel: string;
  guidanceStyle: string;
  voiceOption: string;
}

export default function Welcome({ onStartSession, onGoToHome, initialAdvancedMode = false, onAdvancedModeChange }: WelcomeProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllDevices, setShowAllDevices] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAdvancedView, setShowAdvancedView] = useState<boolean>(false);
  const [showSmartDefaults, setShowSmartDefaults] = useState<boolean>(false);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [modalDeviceInfo, setModalDeviceInfo] = useState<{type: string, label: string, brand?: string, model?: string} | null>(null);
  
  // Advanced view states (only used when advanced view is enabled)
  const [language, setLanguage] = useState<string>("en");
  const [device, setDevice] = useState<string>("thermometer");
  const [deviceBrand, setDeviceBrand] = useState<string>("");
  const [deviceModel, setDeviceModel] = useState<string>("");
  const [guidanceStyle, setGuidanceStyle] = useState<string>("direct");
  const [voiceOption, setVoiceOption] = useState<string>("female");
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hoveredGuidance, setHoveredGuidance] = useState<string | null>(null);


  // Load options from JSON files
  const languages = preferenceOptions.languages;
  const devices = deviceOptions.deviceTypes;
  const deviceBrands = deviceOptions.deviceBrands;
  const deviceModels = deviceOptions.deviceModels;
  const guidanceOptions = preferenceOptions.guidanceOptions;
  const voiceOptions = preferenceOptions.voiceOptions;

  // Popular devices for quick selection
  const popularDevices = [
    { value: "blood-pressure", label: "Blood Pressure Monitor", icon: "🩸", description: "Monitor your blood pressure" },
    { value: "thermometer", label: "Digital Thermometer", icon: "🌡️", description: "Check your temperature" },
    { value: "glucose", label: "Blood Glucose Meter", icon: "🍬", description: "Test blood sugar levels" },
    { value: "nebulizer", label: "Nebulizer", icon: "💨", description: "Respiratory treatment device" },
  ];

  // Auto-detect language from browser
  const autoDetectLanguage = () => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLang = languages.find(lang => lang.value === browserLang);
    return supportedLang ? browserLang : 'en';
  };

  // Search functionality - includes devices, brands, and models
  const filteredDevices = showAllDevices ? devices : devices.filter(device => 
    device.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrands = showAllDevices ? deviceBrands : deviceBrands.filter(brand => 
    brand.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModels = showAllDevices ? deviceModels : deviceModels.filter(model => 
    model.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (deviceBrand && model.brand === deviceBrand && 
     (model.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.value.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Find models that match the searched brand
  const brandMatchedModels = showAllDevices ? [] : deviceModels.filter(model => {
    const brand = deviceBrands.find(b => b.value === model.brand);
    return brand && (
      brand.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Get models for selected category
  const categoryModels = selectedCategory ? deviceModels.filter(model => {
    // Map device categories to model categories
    const categoryMap: Record<string, string[]> = {
      'thermometer': ['oral', 'ear', 'forehead', 'rectal'],
      'blood-pressure': ['arm', 'wrist'],
      'glucose': ['glucose-meter'],
      'pulse-oximeter': ['pulse-oximeter'],
      'weight-scale': ['weight-scale']
    };
    
    const modelCategories = categoryMap[selectedCategory] || [];
    // For now, show all models since we don't have category info in the model data
    // In a real implementation, you would filter by model.category
    return true;
  }) : [];

  // Combine all results, prioritizing models for brand searches (no brands shown)
  const allSearchResults = showAllDevices 
    ? filteredModels.map(m => ({ ...m, type: 'model' })).slice(0, 12) // Show only models when browsing all
    : [
        ...filteredDevices.map(d => ({ ...d, type: 'device' })),
        ...filteredModels.map(m => ({ ...m, type: 'model' })),
        ...brandMatchedModels.map(m => ({ ...m, type: 'model' }))
      ].slice(0, 8);



  // Toggle advanced view
  const toggleAdvancedView = () => {
    setShowAdvancedView(!showAdvancedView);
    localStorage.setItem('simis-advanced-view', (!showAdvancedView).toString());
  };

  // Handle device selection
  const handleDeviceSelect = (deviceValue: string) => {
    setSelectedDevice(deviceValue);
    setShowSmartDefaults(true);
  };


  // Handle smart defaults start
  const handleSmartDefaultsStart = () => {
    const deviceType = modalDeviceInfo ? modalDeviceInfo.type : selectedDevice;
    const config: SessionConfig = {
      language: autoDetectLanguage(),
      device: deviceType,
      deviceBrand: "",
      deviceModel: "",
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
      popularDevices.find(d => d.value === selectedDevice);
    
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
              onClick={() => setShowHowItWorks(true)}
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
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SIMIS</span>
          </h1>
          <p className="text-white/70 text-lg mb-4">Your AI-powered medical device guidance assistant</p>
        </div>
      </div>

      {/* Main Device Selection Container */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-6xl border border-border rounded-3xl px-12 py-20 mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What device do you need help with?</h2>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-xl mx-auto">
              <Icon icon="mingcute:search-line" className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Search for your device..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setShowAllDevices(false); // Reset browse all when user types
                    }
                  }}
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
            </div>
          </div>

          {/* Search Results */}
          {(searchQuery || showAllDevices) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                {showAllDevices ? "All Device Models" : "Search Results"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allSearchResults.map((item) => (
                  <Card 
                    key={`${item.type}-${item.value}`}
                    className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      if (item.type === 'device') {
                        // For devices, set modal info and trigger smart defaults modal
                        setModalDeviceInfo({ type: item.value, label: item.label });
                        setShowSmartDefaults(true);
                      } else if (item.type === 'model') {
                        // For models, find the brand and set complete info
                        const model = deviceModels.find(m => m.value === item.value);
                        const brand = model ? deviceBrands.find(b => b.value === model.brand) : null;
                        setModalDeviceInfo({ 
                          type: 'model', 
                          label: item.label,
                          brand: brand?.label,
                          model: item.label
                        });
                        setShowSmartDefaults(true);
                      }
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">
                        {item.type === 'device' ? (item as any).icon : 
                         item.type === 'brand' ? '🏷️' : '⚙️'}
                      </div>
                      <h4 className="text-white font-semibold mb-2">{item.label}</h4>
                      {showAllDevices && item.type === 'model' ? (
                        <p className="text-white/70 text-sm">
                          {(item as any).brand ? 
                            deviceBrands.find(b => b.value === (item as any).brand)?.label || (item as any).brand :
                            'Unknown Brand'
                          }
                        </p>
                      ) : (
                        <p className="text-white/70 text-sm capitalize">{item.type}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {allSearchResults.length === 0 && (
                <div className="text-center text-white/70 py-8">
                  <p>No devices found matching "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try browsing popular devices below</p>
                </div>
              )}
            </div>
          )}

          {/* Popular Devices */}
          {!searchQuery && !showAllDevices && !selectedCategory && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-6 text-center">Popular Devices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularDevices.map((device) => (
                  <Card 
                    key={device.value}
                    className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 cursor-pointer device-tile"
                    onClick={() => setSelectedCategory(device.value)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{device.icon}</div>
                      <h4 className="text-white font-semibold mb-2">{device.label}</h4>
                      <p className="text-white/70 text-sm">{device.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  className="font-semibold"
                  onClick={() => setShowAllDevices(true)} // Show all devices
                >
                  Browse All Devices
                </Button>
              </div>
            </div>
          )}

          {/* Category Models */}
          {selectedCategory && !searchQuery && !showAllDevices && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {popularDevices.find(d => d.value === selectedCategory)?.label} Models
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                  className="text-white/70 hover:text-white"
                >
                  ← Back to Categories
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModels.map((model) => (
                  <Card 
                    key={model.value}
                    className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      // Find the brand for this model and set complete info
                      const brand = deviceBrands.find(b => b.value === model.brand);
                      setModalDeviceInfo({ 
                        type: 'model', 
                        label: model.label,
                        brand: brand?.label,
                        model: model.label
                      });
                      setShowSmartDefaults(true);
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">⚙️</div>
                      <h4 className="text-white font-semibold mb-2">{model.label}</h4>
                      <p className="text-white/70 text-sm">
                        {deviceBrands.find(b => b.value === model.brand)?.label || 'Unknown Brand'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {categoryModels.length === 0 && (
                <div className="text-center text-white/70 py-8">
                  <p>No models found for this category</p>
                </div>
              )}
            </div>
          )}

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
                {/* Device Type */}
                <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
                  <CardContent className="px-6 py-3">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      data-option-box="device"
                      onClick={() => togglePopover('device')}
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

                    {/* Device Type Popover */}
                    {openPopover === 'device' && (
                      <div 
                        className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
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
                                  setDevice(dev.value);
                                  setOpenPopover(null);
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
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Brand */}
              <Card className="bg-card/50 border-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300 relative">
                <CardContent className="px-6 py-3">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    data-option-box="brand"
                    onClick={() => togglePopover('brand')}
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon icon="mingcute:tag-line" className="w-7 h-7 text-white/70" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {deviceBrand ? deviceBrands.find(b => b.value === deviceBrand)?.label : "Brand"}
                      </p>
                    </div>
                    <div className="text-white/50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                        </div>
                      </div>
                      
                  {/* Brand Popover */}
                  {openPopover === 'brand' && (
                    <div 
                      className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                      data-popover="brand"
                    >
                      <div className="relative">
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-0.5">
                            {deviceBrands.map((brand) => (
                              <div 
                                key={brand.value} 
                                className={`flex items-center space-x-3 p-1.5 rounded-lg transition-colors ${
                                  brand.value === deviceBrand 
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                    : 'hover:bg-white/10 text-white cursor-pointer'
                                }`}
                                onClick={() => {
                                  setDeviceBrand(brand.value);
                                  setDeviceModel(""); // Reset model when brand changes
                                  setOpenPopover(null);
                                }}
                              >
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

              {/* Device Model */}
              <Card className={`border-border backdrop-blur-sm transition-all duration-300 relative ${
                !deviceBrand 
                  ? 'bg-card/30 border-white/10 opacity-50' 
                  : 'bg-card/50 hover:bg-card/70'
              }`}>
                <CardContent className="px-6 py-3">
                  <div 
                    className={`flex items-center space-x-3 ${
                      !deviceBrand ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    data-option-box="model"
                    onClick={() => deviceBrand && togglePopover('model')}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !deviceBrand ? 'bg-white/10' : 'bg-primary/20'
                    }`}>
                      <Icon icon="mingcute:barcode-line" className={`w-7 h-7 ${
                        !deviceBrand ? 'text-white/30' : 'text-white/70'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${
                        !deviceBrand ? 'text-white/50' : 'text-white'
                      }`}>
                        {!deviceBrand 
                          ? "No brand selected" 
                          : deviceModel 
                            ? deviceModels.find(m => m.value === deviceModel)?.label 
                            : "Model"
                        }
                      </p>
                    </div>
                    <div className={!deviceBrand ? 'text-white/30' : 'text-white/50'}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Model Popover */}
                  {openPopover === 'model' && deviceBrand && (
                    <div 
                      className="absolute z-[10001] mt-3 left-0 w-80 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"
                      data-popover="model"
                    >
                      <div className="relative">
                        <div className="p-4 max-h-48 overflow-y-auto">
                          <div className="space-y-0.5">
                            {deviceModels
                              .filter(model => !deviceBrand || model.brand === deviceBrand)
                              .map((model) => (
                              <div 
                                key={model.value} 
                                className={`flex items-center space-x-3 p-1.5 rounded-lg transition-colors ${
                                  model.value === deviceModel 
                                    ? 'bg-primary/20 text-primary hover:bg-primary/30' 
                                    : 'hover:bg-white/10 text-white cursor-pointer'
                                }`}
                                onClick={() => {
                                  setDeviceModel(model.value);
                                  setOpenPopover(null);
                                }}
                              >
                                <span className="flex-1">{model.label}</span>
                                {model.value === deviceModel && (
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
                </div>
              </div>

              {/* AI Preferences Section */}
                <div className="mb-8 relative z-10">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-4">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                  Set preferences
                </h4>
            
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

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
                  onClick={() => setShowHowItWorks(true)}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                    onClick={() => setShowHowItWorks(false)}
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
