import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}

interface EnhancedChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onVoiceInput?: () => void;
  isVoiceEnabled?: boolean;
  isListening?: boolean;
  className?: string;
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

export default function EnhancedChat({ 
  messages, 
  onSendMessage, 
  onVoiceInput,
  isVoiceEnabled = false,
  isListening = false,
  className = ""
}: EnhancedChatProps) {
  const [userQuestion, setUserQuestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [userQuestion]);

  const handleSendMessage = () => {
    if (userQuestion.trim()) {
      onSendMessage(userQuestion);
      setUserQuestion("");
      setShowSuggestions(false);
      setIsTyping(true);
      
      // Simulate typing indicator
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserQuestion(suggestion);
    setShowSuggestions(false);
  };

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <Icon icon="mingcute:chat-3-line" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Assistant</h3>
            <p className="text-white/60 text-xs">Ask me anything about your device</p>
          </div>
        </div>
        
        {isVoiceEnabled && (
          <Button
            onClick={onVoiceInput}
            variant="ghost"
            size="sm"
            className={`text-white hover:bg-white/10 ${
              isListening ? 'bg-red-500/20 text-red-400' : ''
            }`}
          >
            <Icon 
              icon={isListening ? "mingcute:mic-fill" : "mingcute:mic-line"} 
              className="w-5 h-5" 
            />
          </Button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mingcute:chat-3-line" className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-white font-semibold mb-2">Hello! I'm here to help</h4>
            <p className="text-white/70 text-sm mb-4">
              Ask me anything about your medical device or select a suggested question below.
            </p>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-background text-foreground border border-border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              {message.timestamp && (
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background text-foreground border border-border px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {showSuggestions && messages.length === 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-white/80 text-sm font-medium mb-3">Suggested Questions:</h4>
          <div className="grid grid-cols-1 gap-2">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="text-left p-3 bg-card/50 border border-border rounded-lg hover:bg-card/70 transition-colors text-white/80 text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[40px] max-h-[120px]"
              rows={1}
            />
            {userQuestion && (
              <Button
                onClick={() => setUserQuestion("")}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon icon="mingcute:close-line" className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!userQuestion.trim()}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white flex-shrink-0"
          >
            <Icon icon="mingcute:send-fill" className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Voice Input Button */}
        {isVoiceEnabled && (
          <div className="mt-2 flex justify-center">
            <Button
              onClick={onVoiceInput}
              variant="outline"
              size="sm"
              className={`bg-transparent text-white border-white/20 hover:border-white/40 ${
                isListening ? 'bg-red-500/20 border-red-500/40 text-red-400' : ''
              }`}
            >
              <Icon 
                icon={isListening ? "mingcute:mic-fill" : "mingcute:mic-line"} 
                className="w-4 h-4 mr-2" 
              />
              {isListening ? 'Listening...' : 'Voice Input'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
