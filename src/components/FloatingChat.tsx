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
  deviceType?: string;
  showToggleButton?: boolean;
}

interface ChatContext {
  selectedLanguage: string;
  deviceType: string;
  sessionId: string;
  languagePreference: 'strict' | 'flexible';
  deviceContext?: string;
}

// Multilingual suggested questions
const suggestedQuestions = {
  en: [
    "How do I position the device correctly?",
    "What does this error message mean?",
    "How long should I wait for results?",
    "Is this reading normal?",
    "What should I do if the device doesn't turn on?",
    "How do I clean the device?"
  ],
  id: [
    "Bagaimana cara memposisikan perangkat dengan benar?",
    "Apa arti pesan kesalahan ini?",
    "Berapa lama saya harus menunggu hasil?",
    "Apakah pembacaan ini normal?",
    "Apa yang harus saya lakukan jika perangkat tidak menyala?",
    "Bagaimana cara membersihkan perangkat?"
  ],
  th: [
    "วิธีวางอุปกรณ์ให้ถูกต้อง?",
    "ข้อความข้อผิดพลาดนี้หมายถึงอะไร?",
    "ฉันต้องรอผลลัพธ์นานแค่ไหน?",
    "การอ่านค่านี้ปกติหรือไม่?",
    "ฉันควรทำอย่างไรถ้าอุปกรณ์ไม่เปิด?",
    "วิธีทำความสะอาดอุปกรณ์?"
  ],
  fil: [
    "Paano ko ilalagay ang aparato nang tama?",
    "Ano ang ibig sabihin ng mensahe ng error?",
    "Gaano katagal dapat akong maghintay ng resulta?",
    "Normal ba ang pagbasa na ito?",
    "Ano ang dapat kong gawin kung hindi gumana ang aparato?",
    "Paano ko lilinisin ang aparato?"
  ],
  vi: [
    "Làm thế nào để đặt thiết bị đúng cách?",
    "Thông báo lỗi này có nghĩa là gì?",
    "Tôi nên chờ kết quả bao lâu?",
    "Việc đọc này có bình thường không?",
    "Tôi nên làm gì nếu thiết bị không bật?",
    "Làm thế nào để làm sạch thiết bị?"
  ]
};

// Get language-specific questions
const getSuggestedQuestions = (language: string) => {
  return suggestedQuestions[language as keyof typeof suggestedQuestions] || suggestedQuestions.en;
};

// Multilingual welcome messages
const welcomeMessages = {
  en: {
    id: 'welcome',
    message: "👋 **Welcome to SIMIS!**\n\nI'm your AI-powered medical device assistant! 🤖\n\n**🩺 I can help you with:**\n• Digital thermometers\n• Blood pressure monitors\n• Blood glucose meters\n• Nebulizers\n• And other medical devices\n\n**💬 Try asking me:**\n• \"How do I use my thermometer?\"\n• \"Help with blood pressure monitor\"\n• \"What does this error mean?\"\n\n**✨ Let's make medical device usage easy and safe!**",
    isUser: false,
    timestamp: new Date().toISOString(),
    language: 'English'
  },
  id: {
    id: 'welcome',
    message: "👋 **Selamat datang di SIMIS!**\n\nSaya asisten perangkat medis bertenaga AI Anda! 🤖\n\n**🩺 Saya dapat membantu Anda dengan:**\n• Termometer digital\n• Monitor tekanan darah\n• Pengukur glukosa darah\n• Nebulizer\n• Dan perangkat medis lainnya\n\n**💬 Coba tanyakan saya:**\n• \"Bagaimana cara menggunakan termometer?\"\n• \"Cara menggunakan monitor tekanan darah\"\n• \"Apa arti pesan kesalahan ini?\"\n\n**✨ Mari kita buat penggunaan perangkat medis mudah dan aman!**",
    isUser: false,
    timestamp: new Date().toISOString(),
    language: 'Indonesian'
  },
  th: {
    id: 'welcome',
    message: "👋 **ยินดีต้อนรับสู่ SIMIS!**\n\nฉันเป็นผู้ช่วยอุปกรณ์ทางการแพทย์ที่ขับเคลื่อนด้วย AI ของคุณ! 🤖\n\n**🩺 ฉันสามารถช่วยคุณกับ:**\n• เทอร์โมมิเตอร์ดิจิทัล\n• เครื่องวัดความดันเลือด\n• เครื่องวัดน้ำตาลในเลือด\n• เครื่องพ่นยา\n• และอุปกรณ์ทางการแพทย์อื่นๆ\n\n**💬 ลองถามฉัน:**\n• \"วิธีใช้เทอร์โมมิเตอร์?\"\n• \"วิธีใช้เครื่องวัดความดันเลือด\"\n• \"ข้อความข้อผิดพลาดนี้หมายถึงอะไร?\"\n\n**✨ มาทำให้การใช้อุปกรณ์ทางการแพทย์ง่ายและปลอดภัยกันเถอะ!**",
    isUser: false,
    timestamp: new Date().toISOString(),
    language: 'Thai'
  },
  fil: {
    id: 'welcome',
    message: "👋 **Maligayang pagdating sa SIMIS!**\n\nAko ang AI-powered medical device assistant mo! 🤖\n\n**🩺 Makatutulong ako sa iyo sa:**\n• Digital thermometer\n• Blood pressure monitor\n• Blood glucose meter\n• Nebulizer\n• At iba pang medical devices\n\n**💬 Subukan mong magtanong:**\n• \"Paano gamitin ang thermometer?\"\n• \"Paano gamitin ang blood pressure monitor\"\n• \"Ano ang ibig sabihin ng error message?\"\n\n**✨ Gawin nating madali at ligtas ang paggamit ng medical devices!**",
    isUser: false,
    timestamp: new Date().toISOString(),
    language: 'Filipino'
  },
  vi: {
    id: 'welcome',
    message: "👋 **Chào mừng đến với SIMIS!**\n\nTôi là trợ lý thiết bị y tế được hỗ trợ bởi AI của bạn! 🤖\n\n**🩺 Tôi có thể giúp bạn với:**\n• Nhiệt kế kỹ thuật số\n• Máy đo huyết áp\n• Máy đo đường huyết\n• Máy phun sương\n• Và các thiết bị y tế khác\n\n**💬 Hãy thử hỏi tôi:**\n• \"Làm thế nào để sử dụng nhiệt kế?\"\n• \"Cách sử dụng máy đo huyết áp\"\n• \"Thông báo lỗi này có nghĩa là gì?\"\n\n**✨ Hãy làm cho việc sử dụng thiết bị y tế trở nên dễ dàng và an toàn!**",
    isUser: false,
    timestamp: new Date().toISOString(),
    language: 'Vietnamese'
  }
};

// Get language-specific welcome message
const getWelcomeMessage = (language: string) => {
  return welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.en;
};

export default function FloatingChat({ sessionId, language, deviceType = 'general', showToggleButton = true }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(!showToggleButton);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>({
    selectedLanguage: language,
    deviceType: deviceType,
    sessionId: sessionId,
    languagePreference: 'strict'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced language persistence
  useEffect(() => {
    // Store language context in session storage for persistence
    const languageContext = {
      selectedLanguage: language,
      deviceType: deviceType,
      sessionId: sessionId,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`simis-language-context-${sessionId}`, JSON.stringify(languageContext));
    
    // Update chat context
    setChatContext(prev => ({
      ...prev,
      selectedLanguage: language,
      deviceType: deviceType
    }));
  }, [language, deviceType, sessionId]);

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
    
    // Clear the typing timeout since we received a response
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    // Update the chat messages when receiving new messages
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => {
        console.log('Adding message to chat:', newMessage.message);
        console.log('Current messages before adding:', oldMessages.length);
        // Ensure we don't add duplicate messages
        const existingIds = oldMessages.map(msg => msg.id);
        if (!existingIds.includes(newMessage.message.id)) {
          const newMessages = [...oldMessages, newMessage.message];
          console.log('New messages after adding:', newMessages.length);
          return newMessages;
        }
        console.log('Duplicate message detected, not adding');
        return oldMessages;
      }
    );
  });

  // Show welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && messages.length === 0) {
      setHasShownWelcome(true);
      const currentWelcomeMessage = getWelcomeMessage(chatContext.selectedLanguage);
      queryClient.setQueryData(["/api/chat", sessionId], [currentWelcomeMessage]);
    }
  }, [isOpen, hasShownWelcome, messages.length, sessionId, queryClient, chatContext.selectedLanguage]);

  // Debug: Log messages when they change
  useEffect(() => {
    console.log('FloatingChat messages updated:', messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    console.log('Sending message:', message);
    setIsTyping(true);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to hide typing indicator after 30 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      console.log('Typing indicator timeout - no response received');
    }, 30000);

    const userMessage = {
      id: Date.now(),
      sessionId,
      message: message,
      isUser: true,
      language: chatContext.selectedLanguage,
      timestamp: new Date().toISOString(),
      deviceType: chatContext.deviceType
    };

    // Add user message immediately to the chat
    queryClient.setQueryData(
      ["/api/chat", sessionId],
      (oldMessages: ChatMessage[] = []) => {
        console.log('Adding user message to chat:', userMessage);
        return [...oldMessages, userMessage];
      }
    );

    // Send enhanced message context to backend
    const enhancedMessageContext = {
      type: 'chat_message',
      sessionId,
      content: message,
      language: chatContext.selectedLanguage,
      deviceType: chatContext.deviceType,
      languagePreference: chatContext.languagePreference,
      context: {
        deviceType: chatContext.deviceType,
        selectedLanguage: chatContext.selectedLanguage,
        sessionId: chatContext.sessionId
      }
    };

    console.log('Calling sendMessage with enhanced context:', enhancedMessageContext);
    console.log('WebSocket connection status:', isConnected);
    sendMessage(enhancedMessageContext);

    setMessage("");
    // Keep suggestions visible so users can scroll back to them
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Send the suggestion directly without setting it in the input
    if (!suggestion.trim()) return;

    // Show typing indicator for suggestions too
    setIsTyping(true);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to hide typing indicator after 30 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      console.log('Typing indicator timeout - no response received for suggestion');
    }, 30000);

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
      setIsTyping(false); // Hide typing indicator if not connected
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
                        {getSuggestedQuestions(chatContext.selectedLanguage).slice(0, 4).map((question, index) => (
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
                      <div className={`rounded-lg p-3 max-w-[80%] ${
                        msg.isUser 
                          ? 'bg-white/10 text-white' 
                          : 'bg-white/5 text-white border border-white/20'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                          __html: msg.message
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                            .replace(/•/g, '&bull;')
                        }} />
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Enhanced Typing Indicator */}
            {isTyping && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-blue-700 font-medium">SIMIS is thinking...</span>
                  <div className="flex-1 h-1 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                  </div>
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
