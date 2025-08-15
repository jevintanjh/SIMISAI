import { useState } from "react";
import CameraView from "@/components/CameraView";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";
import InstructionCard from "@/components/InstructionCard";
import DeviceLibrary from "@/components/DeviceLibrary";
import FloatingChat from "@/components/FloatingChat";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

interface HomeProps {
  onBack?: () => void;
  sessionConfig?: {
    language: string;
    device: string;
    guidanceStyle: string;
    voiceOption: string;
  };
}

export default function Home({ onBack, sessionConfig }: HomeProps) {
  // Enhanced UI with radio buttons and improved design - v2
  const [currentTab, setCurrentTab] = useState<"scan" | "devices" | "history" | "settings">("scan");
  const [currentLanguage, setCurrentLanguage] = useState(sessionConfig?.language || "en");
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [useMediaPipe, setUseMediaPipe] = useState(true); // Toggle for MediaPipe vs old camera
  const [thermometerDetected, setThermometerDetected] = useState<any>(null);

  // Get display labels for configuration
  const getDisplayLabel = (type: string, value: string) => {
    const languages = [
      { value: "en", label: "🇺🇸 English" },
      { value: "id", label: "🇮🇩 Bahasa Indonesia" },
      { value: "ms", label: "🇲🇾 Bahasa Melayu" },
      { value: "th", label: "🇹🇭 ภาษาไทย" },
      { value: "vi", label: "🇻🇳 Tiếng Việt" },
      { value: "fil", label: "🇵🇭 Filipino" },
      { value: "my", label: "🇲🇲 မြန်မာ" },
      { value: "lo", label: "🇱🇦 ລາວ" },
      { value: "km", label: "🇰🇭 ខ្មែរ" },
      { value: "bn", label: "🇧🇳 Brunei Malay" },
    ];

    const devices = [
      { value: "thermometer", label: "Digital thermometer" },
      { value: "ear", label: "Ear thermometer" },
      { value: "forehead", label: "Forehead thermometer" },
      { value: "blood-pressure", label: "Blood pressure monitor" },
      { value: "glucose", label: "Blood glucose meter" },
    ];

    const guidanceOptions = [
      { value: "direct", label: "Direct instructions" },
      { value: "gentle", label: "Gentle suggestions" },
      { value: "detailed", label: "Detailed explanations" },
    ];

    const voiceOptions = [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "text", label: "Text only" },
    ];

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

  return (
    <div className="font-sans min-h-screen app-background">
      <header className="bg-gradient-to-r from-[#1E1B4B] to-[#312E81] text-white p-6 border-b border-[rgba(139,92,246,0.3)] relative">
        {/* Back Button - Top Left */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10 flex items-center gap-2"
          >
            <Icon icon="mingcute:arrow-left-line" className="w-5 h-5" />
            Back
          </Button>
        )}
        
        <h1 className="text-3xl font-bold text-center mb-2">
          🔬 SIMIS AI - Medical Device Guidance
        </h1>
        <p className="text-center text-[#E2E8F0] mb-4">
          Professional medical device scanning and guidance system
        </p>
        
        {/* Configuration Summary - Prominent Position Below Header */}
        {sessionConfig && (
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3 text-center">Current Session Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-sm text-[#94A3B8] mb-1">Device</div>
                <div className="text-white font-medium">{getDisplayLabel('device', sessionConfig.device)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#94A3B8] mb-1">Language</div>
                <div className="text-white font-medium">{getDisplayLabel('language', sessionConfig.language)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#94A3B8] mb-1">Guidance</div>
                <div className="text-white font-medium">{getDisplayLabel('guidance', sessionConfig.guidanceStyle)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#94A3B8] mb-1">Voice</div>
                <div className="text-white font-medium">{getDisplayLabel('voice', sessionConfig.voiceOption)}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8]">Language:</span>
            <span className="font-medium text-[#A78BFA]">
              {currentLanguage === 'en' ? 'English' : 
               currentLanguage === 'id' ? 'Bahasa Indonesia' :
               currentLanguage === 'th' ? 'ไทย' :
               currentLanguage === 'vi' ? 'Tiếng Việt' :
               currentLanguage === 'fil' ? 'Filipino' : 'English'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8]">MediaPipe:</span>
            <span className={`font-medium ${useMediaPipe ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {useMediaPipe ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </header>
      
      <main className="max-w-md mx-auto min-h-screen relative pb-24 bottom-nav-safe-area">
        {currentTab === "scan" && (
          <div className="space-y-6">
            {/* Two-Panel Layout: Camera View + Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-4 min-h-[600px]">
              {/* Left Panel: Camera View (2/3 width) */}
              <div className="lg:col-span-2">
                {useMediaPipe ? (
                  <div className="camera-view-container h-full min-h-[600px]">
                    <MediaPipeCameraView 
                      onThermometerDetected={(detection) => {
                        setThermometerDetected(detection);
                        console.log('Thermometer detected:', detection);
                      }}
                      sessionConfig={sessionConfig}
                      language={currentLanguage}
                      sessionId={currentSession || undefined}
                    />
                  </div>
                ) : (
                  <div className="camera-view-container h-full min-h-[600px]">
                    <CameraView 
                      language={currentLanguage}
                      sessionId={currentSession || undefined}
                    />
                  </div>
                )}
              </div>
              
              {/* Right Panel: Instructions (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg shadow-lg p-4 h-full min-h-[600px]">
                  <InstructionCard 
                    language={currentLanguage}
                    sessionId={currentSession || "default"}
                  />
                  
                  {/* Floating Chat positioned below InstructionCard */}
                  <div className="mt-4">
                    <FloatingChat 
                      sessionId={currentSession || "default"}
                      language={currentLanguage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentTab === "devices" && (
          <div className="space-y-6">
            <div className="p-4 rounded-b-2xl shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
              <h2 className="text-xl font-bold text-center text-white">Device Library</h2>
              <p className="text-[#E2E8F0] text-center text-sm mt-1">
                Select a device to start a new scanning session
              </p>
            </div>
            
            <DeviceLibrary 
              onDeviceSelect={(deviceId) => {
                // Create new session and switch to scan tab
                setCurrentSession(deviceId);
                setCurrentTab("scan");
              }}
            />
          </div>
        )}
        
        {currentTab === "history" && (
          <div className="space-y-6">
            <div className="p-4 rounded-b-2xl shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
              <h2 className="text-xl font-bold text-center text-white">Scan History</h2>
              <p className="text-[#E2E8F0] text-center text-sm mt-1">
                View your previous scanning sessions and guidance
              </p>
            </div>
            
            <div className="p-6 text-center">
              <div className="rounded-2xl p-8 border-2 border-dashed border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
                <div className="text-[#A78BFA] mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No History Yet</h3>
                <p className="text-[#E2E8F0]">Your guidance history will appear here after you complete your first scan.</p>
              </div>
            </div>
          </div>
        )}
        
        {currentTab === "settings" && (
          <div className="space-y-6">
            <div className="p-4 rounded-b-2xl shadow-lg border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
              <h2 className="text-xl font-bold text-center text-white">Settings</h2>
              <p className="text-[#E2E8F0] text-center text-sm mt-1">
                Customize your app preferences and configuration
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Session Configuration Display */}
              {sessionConfig && (
                <div className="rounded-xl p-4 border border-[rgba(139,92,246,0.3)] shadow-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
                  <h3 className="font-semibold text-white mb-3">Session Configuration</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#94A3B8] text-sm">Device:</span>
                      <p className="text-white font-medium">{getDisplayLabel('device', sessionConfig.device)}</p>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-sm">Language:</span>
                      <p className="text-white font-medium">{getDisplayLabel('language', sessionConfig.language)}</p>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-sm">Guidance Style:</span>
                      <p className="text-white font-medium">{getDisplayLabel('guidance', sessionConfig.guidanceStyle)}</p>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-sm">Voice Option:</span>
                      <p className="text-white font-medium">{getDisplayLabel('voice', sessionConfig.voiceOption)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="rounded-xl p-4 border border-[rgba(139,92,246,0.3)] shadow-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
                <h3 className="font-semibold text-white mb-2">Camera Settings</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[#E2E8F0]">Use MediaPipe</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useMediaPipe}
                      onChange={(e) => setUseMediaPipe(e.target.checked)}
                      className="w-4 h-4 text-[#8B5CF6] bg-[#1E1B4B] border-[rgba(139,92,246,0.3)] rounded focus:ring-[#8B5CF6] focus:ring-2"
                    />
                    <span className="text-sm text-[#A78BFA]">{useMediaPipe ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl p-4 border border-[rgba(139,92,246,0.3)] shadow-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
                <h3 className="font-semibold text-white mb-2">Language Settings</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[#E2E8F0]">Current Language</span>
                  <span className="text-sm font-medium text-[#A78BFA]">
                    {currentLanguage === 'en' ? 'English' : 
                     currentLanguage === 'id' ? 'Bahasa Indonesia' :
                     currentLanguage === 'th' ? 'ไทย' :
                     currentLanguage === 'vi' ? 'Tiếng Việt' :
                     currentLanguage === 'fil' ? 'Filipino' : 'English'}
                  </span>
                </div>
              </div>
              
              <div className="rounded-xl p-4 border border-[rgba(139,92,246,0.3)] shadow-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
                <h3 className="font-semibold text-white mb-2">Session Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#E2E8F0]">Active Session</span>
                    <span className="text-sm font-medium text-[#A78BFA]">
                      {currentSession ? 'Active' : 'None'}
                    </span>
                  </div>
                  {currentSession && (
                    <div className="text-xs text-[#A78BFA] p-2 rounded border border-[rgba(139,92,246,0.3)]" style={{ backgroundColor: 'rgba(30, 27, 75, 0.8)' }}>
                      Session ID: {currentSession}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
      </main>
      
      <BottomNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}
