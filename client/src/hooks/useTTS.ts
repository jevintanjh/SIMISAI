import { useState, useCallback } from 'react';
import { VoicePreference } from '@shared/schema';

export const useTTS = (voicePreference: VoicePreference) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(typeof window !== 'undefined' && 'speechSynthesis' in window);

  // Load voices when component mounts (sometimes they load asynchronously)
  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // Voices might not be loaded yet, try again after a short delay
      setTimeout(() => {
        const retryVoices = window.speechSynthesis.getVoices();
        console.log('Loaded voices:', retryVoices.map(v => ({ 
          name: v.name, 
          lang: v.lang,
          localService: v.localService,
          default: v.default
        })));
      }, 100);
    }
  }, [isSupported]);

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
    console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.name })));
    
    const langCode = language.split('-')[0];
    const matchingVoices = voices.filter(voice => 
      voice.lang.startsWith(langCode) || voice.lang.startsWith('en')
    );

    let preferredVoice = null;
    
    if (voicePreference !== 'text_only' && matchingVoices.length > 0) {
      if (voicePreference === 'male') {
        // Look for common male voice indicators
        preferredVoice = matchingVoices.find(voice => {
          const name = voice.name.toLowerCase();
          return name.includes('male') || 
                 name.includes('david') || name.includes('mark') || name.includes('daniel') ||
                 name.includes('paul') || name.includes('tom') || name.includes('alex') ||
                 name.includes('jorge') || name.includes('luca') || name.includes('henrik') ||
                 name.includes('george') || name.includes('james') || name.includes('christopher');
        });
        
        // If no male voice found, pick a non-female voice as fallback
        if (!preferredVoice) {
          preferredVoice = matchingVoices.find(voice => 
            !voice.name.toLowerCase().includes('female') &&
            !voice.name.toLowerCase().includes('woman') &&
            !voice.name.toLowerCase().includes('lady')
          );
        }
      } else if (voicePreference === 'female') {
        // Look for common female voice indicators  
        preferredVoice = matchingVoices.find(voice => {
          const name = voice.name.toLowerCase();
          return name.includes('female') ||
                 name.includes('samantha') || name.includes('susan') || name.includes('karen') ||
                 name.includes('anna') || name.includes('tessa') || name.includes('fiona') ||
                 name.includes('moira') || name.includes('siri') || name.includes('alexa') ||
                 name.includes('joanna') || name.includes('kate') || name.includes('zira') ||
                 name.includes('hazel') || name.includes('woman') || name.includes('lady');
        });
      }
      
      // Fallback to first matching language voice if gender-specific not found
      if (!preferredVoice) {
        preferredVoice = matchingVoices[0];
      }
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Selected voice:', preferredVoice.name, 'for preference:', voicePreference);
    } else {
      console.log('No matching voice found for preference:', voicePreference, 'language:', language);
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
