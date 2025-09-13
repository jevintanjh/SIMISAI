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

const welcomeMessage = {
  id: 'welcome',
  message: "👋 **Welcome to SIMISAI!**\n\nI'm your AI-powered medical device assistant! 🤖\n\n**🩺 I can help you with:**\n• Digital thermometers\n• Blood pressure monitors\n• Blood glucose meters\n• Nebulizers\n• And other medical devices\n\n**💬 Try asking me:**\n• \"How do I use my thermometer?\"\n• \"Help with blood pressure monitor\"\n• \"What does this error mean?\"\n\n**✨ Let's make medical device usage easy and safe!**",
  isUser: false,
  timestamp: new Date().toISOString(),
  language: 'English'
};

export default function FloatingChat({ sessionId, language, showToggleButton = true }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(!showToggleButton);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", sessionId],
    enabled: isOpen,
    queryFn: async () => {
      // In production, return empty array since we'll use WebSocket
      const isProduction = window.location.hostname.includes('cloudfront.net') || 
                         window.location.hostname.includes('amazonaws.com');
      if (isProduction) {
        return [];
      }
      // In development, fetch from local API
      const response = await fetch(`/api/chat/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  const { sendMessage, isConnected } = useWebSocket((newMessage) => {
    console.log('Received message in FloatingChat:', newMessage);
    setIsTyping(false);
    // Update the chat messages when receiving new messages
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => {
        console.log('Adding message to chat:', newMessage.message);
        return [...oldMessages, newMessage.message];
      }
    );
  });

  // Show welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && messages.length === 0) {
      setHasShownWelcome(true);
      queryClient.setQueryData(["/api/chat", sessionId], [welcomeMessage]);
    }
  }, [isOpen, hasShownWelcome, messages.length, sessionId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

<<<<<<< Updated upstream
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
=======
    console.log('Sending message:', message);
    setIsTyping(true);

    const userMessage = {
      id: Date.now(),
      sessionId,
      message: message,
      isUser: true,
      language,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately to the chat
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => {
        console.log('Adding user message to chat:', userMessage);
        return [...oldMessages, userMessage];
      }
    );

    // Send message to backend
    console.log('Calling sendMessage with:', { type: 'chat_message', sessionId, content: message, language });
    sendMessage({
      type: 'chat_message',
      sessionId,
      content: message,
      language
    });
>>>>>>> Stashed changes

    setMessage("");
    // Keep suggestions visible so users can scroll back to them
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Send the suggestion directly without setting it in the input
    if (!suggestion.trim()) return;

    // Add message to local state immediately for better UX
    const newMessage = {
      id: Date.now(),
      isUser: true,
      message: suggestion
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
        content: suggestion,
        language
      });
    } else {
      // Fallback: show a message that we're not connected
      console.warn('WebSocket not connected, message saved locally only');
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
                <div title={isConnected ? 'Connected' : 'Disconnected'}>
                  <Icon 
                    icon="mingcute:message-3-fill" 
                    className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`}
                  />
                </div>
                <span className="font-medium text-sm">Chat with SIMIS</span>
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
                        <div className="text-sm whitespace-pre-wrap">{msg.message}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-gray-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">SIMISAI is typing...</span>
                </div>
              </div>
            )}
            
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
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
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
