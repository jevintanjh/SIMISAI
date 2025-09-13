import { useEffect, useRef, useState } from "react";

export function useWebSocket(onMessage?: (message: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      // Check if we're in production
      const isProduction = window.location.hostname.includes('cloudfront.net') || 
                          window.location.hostname.includes('amazonaws.com');

      let wsUrl: string;
      if (isProduction) {
        // In production, use AWS API Gateway WebSocket (if available) or fallback to HTTP
        wsUrl = 'wss://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat-ws';
      } else {
        // In development, use local WebSocket
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('localhost');
        if (isLocalhost) {
          wsUrl = `${protocol}//localhost:3001/chat-ws`;
        } else {
          wsUrl = `${protocol}//${window.location.host}/chat-ws`;
        }
      }
      
      console.log('Attempting WebSocket connection to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected to:', wsUrl);
        setIsConnected(true);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = async (message: any) => {
    // Check if we're in production
    const isProduction = window.location.hostname.includes('cloudfront.net') || 
                       window.location.hostname.includes('amazonaws.com');
    
    // In production, always use HTTP fallback since WebSocket isn't configured
    if (isProduction && message.type === 'chat_message') {
      console.log('Using HTTP fallback for chat message:', message.content);
      try {
        const response = await fetch('https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: message.content
            }]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Chat response received:', data);
          
          // Simulate receiving a message
          onMessage?.({
            type: 'chat_message',
            message: {
              id: Date.now(),
              sessionId: message.sessionId,
              message: data.response,
              isUser: false,
              language: message.language,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          console.error('Chat API failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('HTTP fallback failed:', error);
      }
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Use WebSocket in development
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected and not in production mode');
    }
  };

  return { isConnected, sendMessage };
}
