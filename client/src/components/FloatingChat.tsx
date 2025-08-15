import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Mic, Bot } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { ChatMessage } from "@shared/schema";

interface FloatingChatProps {
  sessionId: string;
  language: string;
}

export default function FloatingChat({ sessionId, language }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
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

    sendMessage({
      type: 'chat_message',
      sessionId,
      content: message,
      language
    });

    setMessage("");
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
        <Card className="w-full mb-4 shadow-xl border border-gray-200">
          <CardHeader className="medical-blue text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Live Assistance</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Chat Messages */}
            <div className="max-h-64 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-[hsl(207,90%,54%)]" />
                  <p className="text-sm">Hi! I'm here to help with your medical device guidance. What can I assist you with?</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex space-x-2 ${msg.isUser ? 'justify-end' : ''}`}>
                      {!msg.isUser && (
                        <div className="medical-blue text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-xs flex-shrink-0">
                          <Bot className="w-3 h-3" />
                        </div>
                      )}
                      <div className={`chat-bubble rounded-lg p-3 max-w-xs ${
                        msg.isUser 
                          ? 'medical-blue text-white' 
                          : 'bg-gray-100 text-gray-800'
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
            <div className="p-4 border-t border-gray-200">
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
                    disabled={!message.trim() || !isConnected}
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
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full medical-blue hover:bg-[hsl(207,90%,50%)] text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        <span>Chat with Assistant</span>
      </Button>
    </div>
  );
}
