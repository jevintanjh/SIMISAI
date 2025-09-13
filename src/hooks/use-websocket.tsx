import { useEffect, useRef, useState } from "react";

export function useWebSocket(onMessage?: (message: any) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

      // Prefer explicit base URL when provided via Vite env
      const explicitBase = (import.meta as any).env?.VITE_WS_BASE_URL as string | undefined;

      // For macOS localhost development, try explicit base first, then sensible defaults
      let wsUrl: string;
      if (explicitBase) {
        wsUrl = `${explicitBase.replace(/\/$/, '')}/chat-ws`;
      } else if (process.env.NODE_ENV === 'development') {
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('localhost');
        if (isLocalhost) {
          // API runs on 3001 by default in dev
          wsUrl = `${protocol}//localhost:3001/chat-ws`;
        } else {
          wsUrl = `${protocol}//${window.location.host}/chat-ws`;
        }
      } else {
        wsUrl = `${protocol}//${window.location.host}/chat-ws`;
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

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return { isConnected, sendMessage };
}
