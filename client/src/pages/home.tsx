import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import CameraView from "@/components/CameraView";
import { MediaPipeCameraView } from "@/components/MediaPipeCameraView";
import InstructionCard from "@/components/InstructionCard";
import DeviceLibrary from "@/components/DeviceLibrary";
import FloatingChat from "@/components/FloatingChat";
import BottomNavigation from "@/components/BottomNavigation";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<"scan" | "devices" | "history" | "settings">("scan");
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [useMediaPipe, setUseMediaPipe] = useState(true); // Toggle for MediaPipe vs old camera
  const [thermometerDetected, setThermometerDetected] = useState<any>(null);

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <AppHeader 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        useMediaPipe={useMediaPipe}
        onToggleMediaPipe={setUseMediaPipe}
      />
      
      <main className="max-w-md mx-auto bg-white min-h-screen relative">
        {currentTab === "scan" && (
          <>
            {useMediaPipe ? (
              <div className="p-4">
                <MediaPipeCameraView 
                  onThermometerDetected={(detection) => {
                    setThermometerDetected(detection);
                    console.log('Thermometer detected:', detection);
                  }}
                />
              </div>
            ) : (
              <CameraView />
            )}
            <InstructionCard 
              language={currentLanguage}
              sessionId={currentSession}
            />
          </>
        )}
        
        {currentTab === "devices" && (
          <DeviceLibrary 
            onDeviceSelect={(deviceId) => {
              // Create new session and switch to scan tab
              setCurrentSession(deviceId);
              setCurrentTab("scan");
            }}
          />
        )}
        
        {currentTab === "history" && (
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">History</h2>
            <p className="text-gray-600">Your guidance history will appear here.</p>
          </div>
        )}
        
        {currentTab === "settings" && (
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">App settings and preferences.</p>
          </div>
        )}
        
        <FloatingChat 
          sessionId={currentSession || "default"}
          language={currentLanguage}
        />
      </main>
      
      <BottomNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
    </div>
  );
}
