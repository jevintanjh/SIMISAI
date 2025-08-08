import { useState, useCallback } from 'react';
import { VoicePreference } from '@shared/schema';

export const useTTS = (voicePreference: VoicePreference) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window);

  const speak = useCallback((text: string, language: string = 'en-US') => {
    if (!isSupported || voicePreference === 'text_only' || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Try to find appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => {
      const matchesLang = voice.lang.startsWith(language.split('-')[0]);
      if (voicePreference === 'text_only') return false;
      
      const matchesGender = voicePreference === 'male' ? 
        voice.name.toLowerCase().includes('male') : 
        voice.name.toLowerCase().includes('female');
      return matchesLang && matchesGender;
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, voicePreference]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported
  };
};
