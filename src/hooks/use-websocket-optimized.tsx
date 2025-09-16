import { useEffect, useRef, useState, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  content?: string;
  sessionId?: string;
  language?: string;
  [key: string]: any;
}

interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => Promise<void>;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
}

export function useWebSocketOptimized(onMessage?: (message: any) => void): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [latency, setLatency] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const pingStartTimeRef = useRef<number>(0);
  
  // Connection state tracking
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // Start with 1 second
  
  // Performance monitoring
  const responseTimes = useRef<number[]>([]);
  const maxResponseTimeHistory = 10;

  /**
   * Calculate connection quality based on latency and response times
   */
  const calculateConnectionQuality = useCallback(() => {
    if (!isConnected) return 'disconnected';
    
    const avgLatency = latency;
    const avgResponseTime = responseTimes.current.length > 0 
      ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length 
      : 0;
    
    if (avgLatency < 100 && avgResponseTime < 500) return 'excellent';
    if (avgLatency < 300 && avgResponseTime < 1000) return 'good';
    return 'poor';
  }, [isConnected, latency, responseTimes]);

  /**
   * Update response time tracking
   */
  const updateResponseTime = useCallback((responseTime: number) => {
    responseTimes.current.push(responseTime);
    if (responseTimes.current.length > maxResponseTimeHistory) {
      responseTimes.current.shift();
    }
    
    const avgResponseTime = responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length;
    setConnectionQuality(calculateConnectionQuality());
  }, [calculateConnectionQuality]);

  /**
   * Send ping to measure latency
   */
  const sendPing = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      pingStartTimeRef.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: pingStartTimeRef.current }));
    }
  }, []);

  /**
   * Start heartbeat monitoring
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      sendPing();
    }, 30000); // Ping every 30 seconds
  }, [sendPing]);

  /**
   * Stop heartbeat monitoring
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  }, []);

  /**
   * Optimized connection with exponential backoff
   */
  const connect = useCallback(() => {
    try {
      // Clear existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const isProduction = window.location.hostname.includes('cloudfront.net') || 
                          window.location.hostname.includes('amazonaws.com');

      let wsUrl: string;
      if (isProduction) {
        wsUrl = 'wss://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat-ws';
      } else {
        const isLocalhost = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('localhost');
        if (isLocalhost) {
          wsUrl = `${protocol}//localhost:3001/chat-ws`;
        } else {
          wsUrl = `${protocol}//${window.location.host}/chat-ws`;
        }
      }
      
      console.log('🔗 Attempting optimized WebSocket connection to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected to:', wsUrl);
        setIsConnected(true);
        setConnectionQuality('good'); // Initial quality
        reconnectAttempts.current = 0;
        
        // Start heartbeat monitoring
        startHeartbeat();
        
        // Send initial ping
        setTimeout(() => sendPing(), 1000);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong responses for latency measurement
          if (data.type === 'pong' && data.timestamp === pingStartTimeRef.current) {
            const currentLatency = Date.now() - pingStartTimeRef.current;
            setLatency(currentLatency);
            updateResponseTime(currentLatency);
            return;
          }
          
          // Handle regular messages
          if (data.type !== 'pong') {
            onMessage?.(data);
            
            // Track response time for chat messages
            if (data.type === 'chat_message' && data.responseTime) {
              updateResponseTime(data.responseTime);
            }
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionQuality('disconnected');
        stopHeartbeat();
        
        // Exponential backoff reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current++;
          
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log('❌ Max reconnection attempts reached');
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setConnectionQuality('disconnected');
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
    }
  }, [onMessage, startHeartbeat, stopHeartbeat, sendPing, updateResponseTime]);

  /**
   * Optimized message sending with retry logic
   */
  const sendMessage = useCallback(async (message: WebSocketMessage): Promise<void> => {
    const isProduction = window.location.hostname.includes('cloudfront.net') || 
                        window.location.hostname.includes('amazonaws.com');
    
    // In production, use optimized HTTP fallback
    if (isProduction && message.type === 'chat_message') {
      const startTime = Date.now();
      
      try {
        console.log('🚀 Sending optimized HTTP request:', message.content);
        
        const response = await fetch('https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            'X-Client-Version': 'optimized-v1'
          },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: message.content
            }]
          })
        });
        
        const responseTime = Date.now() - startTime;
        updateResponseTime(responseTime);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Chat response received:', data);
          
          // Simulate receiving a message with performance data
          onMessage?.({
            type: 'chat_message',
            message: {
              id: Date.now(),
              sessionId: message.sessionId,
              message: data.response,
              isUser: false,
              language: message.language,
              timestamp: new Date().toISOString(),
              responseTime: responseTime,
              provider: data.provider?.provider || 'Unknown',
              cacheHit: data.provider?.cacheHit || false
            }
          });
        } else {
          console.error('❌ Chat API failed:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('❌ HTTP request failed:', error);
        const responseTime = Date.now() - startTime;
        updateResponseTime(responseTime);
        throw error;
      }
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Use WebSocket in development with performance tracking
      const startTime = Date.now();
      
      try {
        wsRef.current.send(JSON.stringify(message));
        
        // Track WebSocket send performance
        const sendTime = Date.now() - startTime;
        if (sendTime > 100) { // Only track if it took significant time
          updateResponseTime(sendTime);
        }
      } catch (error) {
        console.error('❌ WebSocket send failed:', error);
        throw error;
      }
    } else {
      console.warn('⚠️ WebSocket not connected and not in production mode');
      throw new Error('WebSocket not available');
    }
  }, [onMessage, updateResponseTime]);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      stopHeartbeat();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, stopHeartbeat]);

  // Update connection quality when latency changes
  useEffect(() => {
    setConnectionQuality(calculateConnectionQuality());
  }, [latency, calculateConnectionQuality]);

  return { 
    isConnected, 
    sendMessage, 
    connectionQuality,
    latency 
  };
}
