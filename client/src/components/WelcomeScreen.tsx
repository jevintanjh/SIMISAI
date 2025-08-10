import React, { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-12 w-full max-w-5xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to SIMIS AI</h1>
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto"></div>
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <LanguageSelector />
          <DeviceSelector />
          <GuidanceSelector guidanceStyle={guidanceStyle} setGuidanceStyle={setGuidanceStyle} />
          <VoiceSelector voicePreference={voicePreference} setVoicePreference={setVoicePreference} />
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="bg-white hover:bg-gray-100 text-slate-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Start
          </Button>
        </div>

        {/* Error Message */}
        {!canStart && (
          <div className="text-center">
            <p className="text-slate-400">Please select a device to continue</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Guidance Selector Component
interface GuidanceSelectorProps {
  guidanceStyle: any;
  setGuidanceStyle: (style: any) => void;
}

const GuidanceSelector: React.FC<GuidanceSelectorProps> = ({ guidanceStyle, setGuidanceStyle }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const guidanceLabels = {
    direct: 'Direct',
    gentle: 'Gentle', 
    detailed: 'Detailed'
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <Settings className="w-5 h-5" />
        Guidance: {guidanceLabels[guidanceStyle]}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800/90 border border-slate-600 rounded-lg p-3 min-w-[200px]">
          <div className="space-y-2">
            {(['direct', 'gentle', 'detailed'] as const).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setGuidanceStyle(style);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                  guidanceStyle === style 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                {style === 'direct' && 'Direct instructions'}
                {style === 'gentle' && 'Gentle suggestions'}
                {style === 'detailed' && 'Detailed explanations'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Voice Selector Component  
interface VoiceSelectorProps {
  voicePreference: any;
  setVoicePreference: (voice: any) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voicePreference, setVoicePreference }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const voiceLabels = {
    male: 'Male',
    female: 'Female',
    text_only: 'Text Only'
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 px-6 py-3 rounded-lg flex items-center gap-2"
      >
        <Mic className="w-5 h-5" />
        Voice: {voiceLabels[voicePreference]}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-800/90 border border-slate-600 rounded-lg p-3 min-w-[150px]">
          <div className="space-y-2">
            {(['male', 'female', 'text_only'] as const).map((voice) => (
              <button
                key={voice}
                onClick={() => {
                  setVoicePreference(voice);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  voicePreference === voice 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {voice === 'text_only' ? 'Text' : voice.charAt(0).toUpperCase() + voice.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
