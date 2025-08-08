import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Settings, Mic, MessageSquare } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { DeviceSelector } from './DeviceSelector';
import { useGuidanceStore } from '@/store/guidanceStore';

export const WelcomeScreen: React.FC = () => {
  const {
    selectedDevice,
    selectedLanguage,
    guidanceStyle,
    voicePreference,
    setGuidanceStyle,
    setVoicePreference,
    startSession
  } = useGuidanceStore();

  const canStart = selectedDevice !== null;

  const handleStart = () => {
    if (canStart) {
      startSession();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-purple-900/50 border-purple-700/50 backdrop-blur-lg">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to SIMIS AI</h1>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-8"></div>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {/* Language Button */}
            <LanguageSelector />
            
            {/* Device Button */}
            <DeviceSelector />
            
            {/* Guidance Style Button */}
            <div className="relative group">
              <Button
                variant="outline"
                size="lg"
                className="bg-purple-800/50 border-purple-600 text-purple-100 hover:bg-purple-700/50 px-6 py-3"
              >
                <Settings className="w-5 h-5 mr-2" />
                Guidance
              </Button>
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50">
                <Card className="bg-purple-900/90 border-purple-600 p-4 min-w-[200px]">
                  <div className="space-y-2">
                    {(['direct', 'gentle', 'detailed'] as const).map((style) => (
                      <Button
                        key={style}
                        variant={guidanceStyle === style ? "default" : "ghost"}
                        size="sm"
                        className="w-full text-left justify-start text-purple-100 hover:bg-purple-700/50"
                        onClick={() => setGuidanceStyle(style)}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)} Instructions
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Voice Button */}
            <div className="relative group">
              <Button
                variant="outline"
                size="lg"
                className="bg-purple-800/50 border-purple-600 text-purple-100 hover:bg-purple-700/50 px-6 py-3"
              >
                <Mic className="w-5 h-5 mr-2" />
                Voice
              </Button>
              <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50">
                <Card className="bg-purple-900/90 border-purple-600 p-4 min-w-[200px]">
                  <div className="space-y-2">
                    {(['male', 'female', 'text_only'] as const).map((voice) => (
                      <Button
                        key={voice}
                        variant={voicePreference === voice ? "default" : "ghost"}
                        size="sm"
                        className="w-full text-left justify-start text-purple-100 hover:bg-purple-700/50"
                        onClick={() => setVoicePreference(voice)}
                      >
                        {voice === 'text_only' ? 'Text Only' : voice.charAt(0).toUpperCase() + voice.slice(1)} Voice
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!canStart}
              className="bg-white text-purple-900 hover:bg-purple-100 px-8 py-3 font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          </div>

          {!canStart && (
            <p className="text-purple-300 text-sm">
              Please select a device to continue
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
