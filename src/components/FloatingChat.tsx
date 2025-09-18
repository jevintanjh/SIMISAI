import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { MessageCircle, X, Send, Mic, Bot } from "lucide-react";
import { Icon } from "@iconify/react";
import { useWebSocket } from "../hooks/use-websocket";
import { API_CONFIG } from "../config/api";
import type { ChatMessage } from "../../shared/schema";

interface FloatingChatProps {
  sessionId: string;
  language: string;
  showToggleButton?: boolean;
  sessionConfig?: {
    language: string;
    device: string;
    guidanceStyle: string;
    voiceOption: string;
  };
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

export default function FloatingChat({ sessionId, language, showToggleButton = true, sessionConfig }: FloatingChatProps) {
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

  const { sendMessage: sendWebSocketMessage, isConnected } = useWebSocket((newMessage) => {
    // Update the chat messages when receiving new messages
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => [...oldMessages, newMessage.message]
    );
  });

  // HTTP API fallback for sending messages
  const sendMessageViaAPI = async (messageText: string, language: string, sessionConfig: any) => {
    try {
      const response = await fetch(API_CONFIG.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: language,
          sessionConfig: sessionConfig
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        isUser: false,
        message: data.response || data.message || "I'm sorry, I couldn't process your request right now."
      };

      queryClient.setQueryData(
        ["/api/chat", sessionId],
        (oldMessages: any[] = []) => [...oldMessages, aiMessage]
      );

      return data;
    } catch (error) {
      console.error('API chat error:', error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        isUser: false,
        message: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
      };

      queryClient.setQueryData(
        ["/api/chat", sessionId],
        (oldMessages: any[] = []) => [...oldMessages, errorMessage]
      );
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageText = message;
    setMessage(""); // Clear input immediately

    // Add user message to local state immediately for better UX
    const newMessage = {
      id: Date.now(),
      isUser: true,
      message: messageText
    };

    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: any[] = []) => [...oldMessages, newMessage]
    );

    const config = sessionConfig || {
      language,
      device: 'thermometer',
      guidanceStyle: 'direct',
      voiceOption: 'text'
    };

    // Try to send via WebSocket if connected, otherwise use HTTP API
    if (isConnected) {
      sendWebSocketMessage({
        type: 'chat_message',
        sessionId,
        content: messageText,
        language,
        sessionConfig: config
      });
    } else {
      // Use HTTP API fallback
      console.log('WebSocket not connected, using HTTP API fallback');
      await sendMessageViaAPI(messageText, language, config);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Send the suggestion directly without setting it in the input
    if (!suggestion.trim()) return;

    // Add user message to local state immediately for better UX
    const newMessage = {
      id: Date.now(),
      isUser: true,
      message: suggestion
    };

    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: any[] = []) => [...oldMessages, newMessage]
    );

    const config = sessionConfig || {
      language,
      device: 'thermometer',
      guidanceStyle: 'direct',
      voiceOption: 'text'
    };

    // Try to send via WebSocket if connected, otherwise use HTTP API
    if (isConnected) {
      sendWebSocketMessage({
        type: 'chat_message',
        sessionId,
        content: suggestion,
        language,
        sessionConfig: config
      });
    } else {
      // Use HTTP API fallback
      console.log('WebSocket not connected, using HTTP API fallback');
      await sendMessageViaAPI(suggestion, language, config);
    }
  };

  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    if (isListening) {
      // Cancel current recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
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
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
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
        <Card className="w-full h-[500px] border-0 shadow-none flex flex-col">
          <CardHeader className="text-white p-4 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-center space-x-2">
                <div title={isConnected ? 'WebSocket Connected' : 'Using HTTP API'}>
                  <Icon
                    icon="mingcute:message-3-fill"
                    className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-blue-400'}`}
                  />
                </div>
                <span className="font-medium text-sm">Chat with SIMIS</span>
                <span className="text-xs text-white/60">
                  {isConnected ? 'Live' : 'API'}
                </span>
              </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col flex-1 min-h-0">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : (
                <div className="space-y-3 p-2">
                  {/* SIMIS Introduction Message - Always shown */}
                  <div className="flex justify-start">
                    <div className="rounded-lg text-white">
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
                      <div className={`rounded-lg p-3 ${
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
            <div className="pt-4 flex-shrink-0 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 text-sm rounded-lg min-w-0"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  size="sm"
                  className="medical-blue hover:bg-white hover:text-primary rounded-lg w-10 h-10 p-0 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleVoiceInput}
                  size="sm"
                  variant="outline"
                  className={`rounded-lg w-10 h-10 p-0 flex-shrink-0 ${isListening ? 'bg-red-100 border-red-300 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-red-600' : 'text-gray-600'}`} />
                </Button>
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
