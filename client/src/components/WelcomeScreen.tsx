import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Settings, Mic, MessageSquare, Camera, Volume2, MessageCircle, Eye } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { DeviceSelector } from './DeviceSelector';
import { useGuidanceStore } from '@/store/guidanceStore';
import simulationImage from '@assets/image_1754807445808.png';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-start justify-center p-6 py-12">
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-12 w-full max-w-7xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to SIMIS AI</h1>
          <p className="text-xl text-slate-300 mb-6">Your AI-powered medical device guidance assistant</p>
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto"></div>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">How SIMIS AI Works</h2>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600">
                <img 
                  src={simulationImage} 
                  alt="SIMIS AI in action - showing thermometer detection and step-by-step guidance"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <p className="text-slate-400 text-sm text-center mt-3">
                  Real-time device detection with multilingual voice guidance
                </p>
              </div>
            </div>

            {/* Right side - Features */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Device Detection</h3>
                  <p className="text-slate-300">AI recognizes your medical device using your camera and provides instant feedback</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Volume2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Voice Guidance</h3>
                  <p className="text-slate-300">Step-by-step instructions in your preferred language with male or female voice options</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Interactive Chat</h3>
                  <p className="text-slate-300">Ask questions anytime during the process and get instant, helpful responses</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Personalized Experience</h3>
                  <p className="text-slate-300">Choose your guidance style from direct, gentle, or detailed instructions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Steps */}
          <div className="mt-12 bg-slate-800/30 rounded-xl p-6 border border-slate-600">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Get Started in 3 Simple Steps</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h4 className="text-lg font-semibold text-white mb-2">Select Your Device</h4>
                <p className="text-slate-300 text-sm">Choose from thermometer, blood pressure monitor, or glucose meter</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h4 className="text-lg font-semibold text-white mb-2">Pick Your Language</h4>
                <p className="text-slate-300 text-sm">Available in 10+ Southeast Asian languages with native voice support</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h4 className="text-lg font-semibold text-white mb-2">Start Guidance</h4>
                <p className="text-slate-300 text-sm">Follow real-time instructions with your camera active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration & Start Section */}
        <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-600">
          <h3 className="text-2xl font-bold text-white text-center mb-6">Configure Your Session</h3>
          
          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <LanguageSelector />
            <DeviceSelector />
            <GuidanceSelector guidanceStyle={guidanceStyle} setGuidanceStyle={setGuidanceStyle} />
            <VoiceSelector voicePreference={voicePreference} setVoicePreference={setVoicePreference} />
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleStart}
              disabled={!canStart}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 mx-auto"
            >
              <Play className="w-6 h-6" />
              Start AI Guidance
            </Button>
            
            {/* Error Message */}
            {!canStart && (
              <p className="text-slate-400 mt-4">Please select a device to continue</p>
            )}
          </div>
        </div>
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
