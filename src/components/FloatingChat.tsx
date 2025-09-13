import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MessageCircle, X, Send, Mic, Bot } from "lucide-react";
import { Icon } from "@iconify/react";
import { useWebSocket } from "../hooks/use-websocket";
import type { ChatMessage } from "../../shared/schema";

interface FloatingChatProps {
  sessionId: string;
  language: string;
  showToggleButton?: boolean;
}

const suggestedQuestions = [
  "How do I position the device correctly?",
  "What does this error message mean?",
  "How long should I wait for results?",
  "Is this reading normal?",
  "What should I do if the device doesn't turn on?",
  "How do I clean the device?",
  "Can I use this on children?",
  "What's the difference between oral and rectal readings?"
];

export default function FloatingChat({ sessionId, language, showToggleButton = true }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(!showToggleButton);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", sessionId],
    enabled: isOpen,
  });

  const { sendMessage, isConnected } = useWebSocket((newMessage) => {
    // Update the chat messages when receiving new messages
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => [...oldMessages, newMessage.message]
    );
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add message to local state immediately for better UX
    const newMessage = {
      id: Date.now(),
      isUser: true,
      message: message
    };
    
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: any[] = []) => [...oldMessages, newMessage]
    );

    // Try to send via WebSocket if connected
    if (isConnected) {
      sendMessage({
        type: 'chat_message',
        sessionId,
        content: message,
        language
      });
    } else {
      // Fallback: show a message that we're not connected
      console.warn('WebSocket not connected, message saved locally only');
    }

    setMessage("");
    // Keep suggestions visible so users can scroll back to them
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    // Don't hide suggestions immediately - let them scroll up naturally
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Map language codes to proper locale identifiers for speech recognition
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'id': 'id-ID',
      'ms': 'ms-MY',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'fil': 'fil-PH',
      'my': 'my-MM',
      'lo': 'lo-LA',
      'km': 'km-KH',
      'bn': 'ms-BN'
    };
    
    recognition.lang = languageMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {isOpen && (
        <Card className="w-full h-full shadow-xl">
          <CardHeader className="text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-center space-x-2">
                <div title={isConnected ? 'Connected' : 'Disconnected'}>
                  <Icon 
                    icon="mingcute:message-3-fill" 
                    className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`}
                  />
                </div>
                <span className="font-medium text-sm">Chat with SIMIS</span>
              </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                <div className="space-y-3">
                  {/* SIMIS Introduction Message - Always shown */}
                  <div className="flex justify-start">
                    <div className="rounded-lg p-3 max-w-xs text-white">
                      <p className="text-sm">Hi! I'm here to help with your medical device guidance. What can I assist you with?</p>
                    </div>
                  </div>
                  
                  {/* Quick Questions - Always shown */}
                  {showSuggestions && (
                    <div className="mt-4">
                      <p className="text-xs text-white/70 mb-2">Quick questions:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestedQuestions.slice(0, 4).map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(question)}
                            className="text-left text-sm bg-background hover:bg-background/80 text-white border border-border rounded-lg px-4 py-2 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Chat Messages */}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`rounded-lg p-3 max-w-xs ${
                        msg.isUser 
                          ? 'bg-white/10 text-white' 
                          : 'text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 text-sm rounded-lg"
                />
                <div className="flex space-x-1 flex-shrink-0">
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    size="sm"
                    className="medical-blue hover:bg-[hsl(207,90%,50%)] rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleVoiceInput}
                    disabled={isListening}
                    size="sm"
                    variant="outline"
                    className={`rounded-lg ${isListening ? 'bg-red-100 border-red-300' : 'bg-gray-100'}`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : 'text-gray-600'}`} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Toggle Button */}
      {showToggleButton && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full medical-blue hover:bg-[hsl(207,90%,50%)] text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          <span>Chat with SIMIS</span>
        </Button>
      )}
    </div>
  );
}
