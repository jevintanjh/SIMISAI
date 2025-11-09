# WebSocket Communication

## Overview

SIMISAI uses WebSocket connections for real-time features including AI chat assistance, live guidance sessions, and device detection updates.

## Connection Endpoint

### Development
```
ws://localhost:3001/chat-ws
```

### Production
```
wss://api.simisai.com/chat-ws
```

## Connection Protocol

### Initial Connection
```javascript
const socket = new WebSocket('ws://localhost:3001/chat-ws');

socket.onopen = (event) => {
  console.log('Connected to SIMISAI chat service');
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleIncomingMessage(message);
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = (event) => {
  console.log('Connection closed:', event.code, event.reason);
};
```

## Message Format

### Base Message Structure
```json
{
  "type": "message_type",
  "sessionId": "unique-session-id",
  "timestamp": "2025-11-09T10:30:00Z",
  "data": {
    // Message-specific payload
  }
}
```

## Chat Messages

### Send Chat Message
**Client → Server**
```json
{
  "type": "chat_message",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:30:00Z",
  "data": {
    "message": "How do I use the blood pressure monitor?",
    "language": "en",
    "deviceContext": {
      "deviceId": "bp-monitor-digital",
      "confidence": 0.95
    },
    "userContext": {
      "experienceLevel": "beginner"
    }
  }
}
```

### Receive Chat Response
**Server → Client**
```json
{
  "type": "chat_response",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:30:15Z",
  "data": {
    "response": "I'll help you use the blood pressure monitor. First, ensure you're sitting comfortably with your feet flat on the floor...",
    "language": "en",
    "confidence": 0.98,
    "processingTime": 1.23,
    "sources": ["device_instructions", "medical_guidelines"],
    "followUpSuggestions": [
      "What's the proper cuff placement?",
      "How often should I measure my blood pressure?"
    ],
    "mediaElements": {
      "images": [],
      "videos": [],
      "audioInstructions": true
    }
  }
}
```

## Guidance Session Messages

### Start Guidance Session
**Client → Server**
```json
{
  "type": "start_guidance",
  "sessionId": "guidance-session-456",
  "timestamp": "2025-11-09T10:35:00Z",
  "data": {
    "deviceId": "bp-monitor-digital",
    "language": "en",
    "userPreferences": {
      "voiceInstructions": true,
      "stepByStep": true,
      "confirmEachStep": true
    }
  }
}
```

### Guidance Step Update
**Server → Client**
```json
{
  "type": "guidance_step",
  "sessionId": "guidance-session-456",
  "timestamp": "2025-11-09T10:35:15Z",
  "data": {
    "currentStep": 2,
    "totalSteps": 8,
    "instruction": {
      "text": "Wrap the cuff around your upper arm, about 1 inch above your elbow",
      "audio": "https://assets.simisai.com/audio/bp-step2-en.mp3",
      "image": "https://assets.simisai.com/images/bp-cuff-placement.jpg",
      "duration": 30
    },
    "progress": 0.25,
    "canProceed": false,
    "requiredConfirmation": true
  }
}
```

### Confirm Step Completion
**Client → Server**
```json
{
  "type": "step_completed",
  "sessionId": "guidance-session-456",
  "timestamp": "2025-11-09T10:36:00Z",
  "data": {
    "stepNumber": 2,
    "success": true,
    "timeSpent": 45,
    "notes": "Cuff placed correctly on left arm"
  }
}
```

## Device Detection Messages

### Real-time Detection Updates
**Server → Client**
```json
{
  "type": "device_detected",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:40:00Z",
  "data": {
    "device": {
      "id": "thermometer-ear",
      "name": "Ear Thermometer",
      "confidence": 0.94,
      "boundingBox": {
        "x": 120,
        "y": 80,
        "width": 200,
        "height": 150
      }
    },
    "alternativeDevices": [
      {
        "id": "thermometer-oral",
        "confidence": 0.73
      }
    ],
    "trackingId": "detection-789"
  }
}
```

### Detection Lost
**Server → Client**
```json
{
  "type": "device_lost",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:42:00Z",
  "data": {
    "lastKnownDevice": "thermometer-ear",
    "trackingId": "detection-789",
    "reason": "out_of_frame"
  }
}
```

## System Messages

### Session Status Updates
**Server → Client**
```json
{
  "type": "session_status",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:45:00Z",
  "data": {
    "status": "active",
    "connectedClients": 1,
    "uptime": 300,
    "services": {
      "chat": "operational",
      "cv": "operational",
      "guidance": "operational"
    }
  }
}
```

### Error Messages
**Server → Client**
```json
{
  "type": "error",
  "sessionId": "session-123",
  "timestamp": "2025-11-09T10:30:30Z",
  "data": {
    "code": "CV_SERVICE_UNAVAILABLE",
    "message": "Computer vision service is temporarily unavailable",
    "severity": "warning",
    "retryable": true,
    "retryAfter": 5000
  }
}
```

## Client Implementation

### React Hook Example
```typescript
import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  sessionId: string;
  timestamp: string;
  data: any;
}

export const useSimisaiWebSocket = (sessionId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/chat-ws');

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      if (message.sessionId === sessionId) {
        setMessages(prev => [...prev, message]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const sendMessage = (type: string, data: any) => {
    if (socket && isConnected) {
      const message = {
        type,
        sessionId,
        timestamp: new Date().toISOString(),
        data
      };
      socket.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    messages,
    sendMessage,
    sendChatMessage: (message: string, language = 'en') =>
      sendMessage('chat_message', { message, language }),
    startGuidance: (deviceId: string, language = 'en') =>
      sendMessage('start_guidance', { deviceId, language }),
    confirmStep: (stepNumber: number, success = true) =>
      sendMessage('step_completed', { stepNumber, success })
  };
};
```

### Usage Example
```tsx
import { useSimisaiWebSocket } from './hooks/useSimisaiWebSocket';

const ChatInterface = ({ sessionId }: { sessionId: string }) => {
  const {
    isConnected,
    messages,
    sendChatMessage
  } = useSimisaiWebSocket(sessionId);

  const handleSendMessage = (message: string) => {
    sendChatMessage(message, 'en');
  };

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>
        {messages
          .filter(msg => msg.type === 'chat_response')
          .map((msg, index) => (
            <div key={index}>{msg.data.response}</div>
          ))}
      </div>
      <button onClick={() => handleSendMessage('Hello!')}>
        Send Test Message
      </button>
    </div>
  );
};
```

## Connection Management

### Reconnection Strategy
```javascript
class SimisaiWebSocketManager {
  constructor(url, sessionId) {
    this.url = url;
    this.sessionId = sessionId;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('Connected to SIMISAI WebSocket');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.socket.onclose = (event) => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.reconnectDelay *= 2; // Exponential backoff
          console.log(`Reconnection attempt ${this.reconnectAttempts}`);
          this.connect();
        }, this.reconnectDelay);
      }
    };
  }

  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        ...message,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }));
    }
  }
}
```

## Error Codes

### WebSocket-Specific Errors
- `WS_INVALID_MESSAGE_FORMAT` - Malformed JSON message
- `WS_SESSION_NOT_FOUND` - Invalid session ID
- `WS_RATE_LIMIT_EXCEEDED` - Too many messages per minute
- `WS_SERVICE_UNAVAILABLE` - Backend service offline
- `WS_AUTHENTICATION_FAILED` - Session expired or invalid

### Close Codes
- `1000` - Normal closure
- `1002` - Protocol error (invalid message format)
- `1008` - Policy violation (rate limiting)
- `1011` - Internal server error
- `1012` - Service restart

## Performance Considerations

### Message Queuing
- Messages are queued during reconnection attempts
- Maximum queue size: 100 messages
- Oldest messages are dropped when queue is full

### Rate Limiting
- Maximum 60 messages per minute per session
- Burst allowance: 10 messages in 10 seconds
- Rate limit headers included in error responses

### Connection Lifecycle
- Idle timeout: 10 minutes of inactivity
- Heartbeat ping every 30 seconds
- Graceful degradation when services are unavailable

---

**Last Updated**: November 2025
**WebSocket Version**: 1.0.0
**Related Documentation**: [REST API](endpoints.md) | [Computer Vision](computer-vision.md)