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
