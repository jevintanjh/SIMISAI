import { useCallback, useRef } from "react";

export function useVoice() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, language: string = "en", rate: number = 1) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes to proper locale identifiers
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'id': 'id-ID',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'fil': 'fil-PH'
    };
    
    utterance.lang = languageMap[language] || 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const pause = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }, []);

  return { speak, stop, pause, resume };
}
