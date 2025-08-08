import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, MicOff } from 'lucide-react';
import { useGuidanceStore } from '@/store/guidanceStore';
import { aiService } from '@/lib/aiService';
import { useTTS } from '@/hooks/useTTS';

export const ChatInterface: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    chatMessages,
    addChatMessage,
    selectedLanguage,
    selectedDevice,
    voicePreference,
    currentSession
  } = useGuidanceStore();

  const { speak, isSpeaking } = useTTS(voicePreference);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedDevice || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addChatMessage('user', userMessage);
    setIsLoading(true);

    try {
      const context = currentSession 
        ? `Current step: ${currentSession.currentStep + 1}/${currentSession.totalSteps}`
        : 'Initial setup';

      const response = await aiService.answerQuestion(
        userMessage,
        selectedLanguage,
        selectedDevice,
        context
      );

      addChatMessage('assistant', response);
      
      if (voicePreference !== 'text_only') {
        speak(response, selectedLanguage);
      }
    } catch (error) {
      addChatMessage('assistant', "I'm sorry, I couldn't process your question right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      addChatMessage('assistant', 'Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage.replace('_', '-');

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      addChatMessage('assistant', 'Could not recognize speech. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <Card className="bg-purple-900/30 border-purple-700/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-purple-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Chat with Assistant
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-80 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-purple-300 py-8">
            <p className="text-sm">
              Why is the cuff too loose?
            </p>
            <p className="text-xs mt-2 opacity-75">
              Manset harus pas tetapi tidak ketat. Anda harus bisa menyelipkan satu jari di bawahnya dengan nyaman.
            </p>
          </div>
        ) : (
          chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-800/50 text-purple-100 border border-purple-700/50'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-800/50 text-purple-100 border border-purple-700/50 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-700/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chat with Assistant"
              disabled={isLoading}
              className="bg-purple-800/30 border-purple-600 text-purple-100 placeholder-purple-400 pr-12 focus:border-purple-400"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleListening}
              disabled={isLoading}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                isListening ? 'text-red-400' : 'text-purple-400'
              } hover:text-purple-200`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
