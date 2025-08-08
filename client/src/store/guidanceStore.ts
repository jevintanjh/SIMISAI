import { create } from 'zustand';
import { DeviceType, Language, GuidanceStyle, VoicePreference, GuidanceSession } from '@shared/schema';

interface GuidanceState {
  // Configuration
  selectedDevice: DeviceType | null;
  selectedLanguage: Language;
  guidanceStyle: GuidanceStyle;
  voicePreference: VoicePreference;
  
  // Session state
  currentSession: GuidanceSession | null;
  isSessionActive: boolean;
  
  // UI state
  showWelcome: boolean;
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  
  // Actions
  setSelectedDevice: (device: DeviceType) => void;
  setSelectedLanguage: (language: Language) => void;
  setGuidanceStyle: (style: GuidanceStyle) => void;
  setVoicePreference: (preference: VoicePreference) => void;
  startSession: () => void;
  endSession: () => void;
  nextStep: () => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;
  setShowWelcome: (show: boolean) => void;
}

export const useGuidanceStore = create<GuidanceState>((set, get) => ({
  // Initial state
  selectedDevice: null,
  selectedLanguage: 'english',
  guidanceStyle: 'gentle',
  voicePreference: 'female',
  currentSession: null,
  isSessionActive: false,
  showWelcome: true,
  chatMessages: [],

  // Actions
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  
  setGuidanceStyle: (style) => set({ guidanceStyle: style }),
  
  setVoicePreference: (preference) => set({ voicePreference: preference }),

  startSession: () => {
    const { selectedDevice, selectedLanguage, guidanceStyle, voicePreference } = get();
    
    if (!selectedDevice) return;

    const session: GuidanceSession = {
      id: `session_${Date.now()}`,
      deviceType: selectedDevice,
      language: selectedLanguage,
      guidanceStyle,
      voicePreference,
      currentStep: 0,
      totalSteps: 5,
      isActive: true,
      createdAt: new Date(),
      completedSteps: [],
      feedback: []
    };

    set({
      currentSession: session,
      isSessionActive: true,
      showWelcome: false
    });
  },

  endSession: () => {
    set({
      currentSession: null,
      isSessionActive: false,
      showWelcome: true,
      chatMessages: []
    });
  },

  nextStep: () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const nextStepNumber = currentSession.currentStep + 1;
    const updatedCompletedSteps = [...currentSession.completedSteps, currentSession.currentStep];

    if (nextStepNumber >= currentSession.totalSteps) {
      // Session complete
      set({
        currentSession: {
          ...currentSession,
          currentStep: nextStepNumber,
          completedSteps: updatedCompletedSteps,
          isActive: false
        }
      });
    } else {
      set({
        currentSession: {
          ...currentSession,
          currentStep: nextStepNumber,
          completedSteps: updatedCompletedSteps
        }
      });
    }
  },

  addChatMessage: (role, content) => {
    const { chatMessages } = get();
    const newMessage = {
      role,
      content,
      timestamp: new Date()
    };
    
    set({
      chatMessages: [...chatMessages, newMessage]
    });
  },

  clearChat: () => set({ chatMessages: [] }),

  setShowWelcome: (show) => set({ showWelcome: show })
}));
