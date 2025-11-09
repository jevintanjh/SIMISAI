# API Reference - REST Endpoints

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.simisai.com` (via API Gateway)
- **Demo**: Via API Gateway ID `2e7j2vait1`

## Authentication
Currently uses session-based authentication with PostgreSQL store. No explicit user authentication required.

## Core API Endpoints

### 🩺 Medical Devices API

#### Get All Devices
```http
GET /api/devices
```

**Response:**
```json
{
  "devices": [
    {
      "id": "thermometer-oral",
      "name": "Oral Thermometer",
      "type": "thermometer",
      "category": "temperature",
      "description": "Digital oral thermometer for body temperature measurement",
      "multilingual": {
        "en": "Oral Thermometer",
        "id": "Termometer Oral",
        "th": "เครื่องวัดไข้ทางปาก",
        "vi": "Nhiệt kế đường miệng",
        "fil": "Thermometer sa Bibig"
      }
    }
  ]
}
```

#### Get Device Instructions
```http
GET /api/devices/{deviceId}/instructions
```

**Parameters:**
- `deviceId` (string): Device identifier (e.g., "thermometer-oral")

**Query Parameters:**
- `language` (string): Language code (en, id, th, vi, fil) - Default: "en"

**Response:**
```json
{
  "deviceId": "thermometer-oral",
  "instructions": [
    {
      "step": 1,
      "instruction": "Remove the thermometer from its packaging",
      "multilingual": {
        "en": "Remove the thermometer from its packaging",
        "id": "Keluarkan termometer dari kemasannya",
        "th": "นำเครื่องวัดไข้ออกจากบรรจุภัณฑ์",
        "vi": "Lấy nhiệt kế ra khỏi bao bì",
        "fil": "Alisin ang thermometer mula sa packaging"
      },
      "duration": 10,
      "important": false
    }
  ]
}
```

### 🤖 AI Chat API

#### Send Chat Message
```http
POST /api/chat/ask
```

**Request Body:**
```json
{
  "sessionId": "session-123",
  "question": "How do I use the blood pressure monitor?",
  "language": "en",
  "deviceContext": {
    "deviceId": "bp-monitor-digital",
    "detectionConfidence": 0.95
  }
}
```

**Response:**
```json
{
  "sessionId": "session-123",
  "response": "I'll help you use the blood pressure monitor. First, make sure you're sitting comfortably...",
  "language": "en",
  "confidence": 0.98,
  "sources": ["device_instructions", "medical_guidelines"],
  "followUpSuggestions": [
    "What's the proper cuff placement?",
    "How often should I measure my blood pressure?",
    "What do the numbers mean?"
  ]
}
```

#### Get Chat History
```http
GET /api/chat/history
```

**Query Parameters:**
- `sessionId` (string): Session identifier
- `limit` (number): Maximum messages to return - Default: 50
- `offset` (number): Pagination offset - Default: 0

**Response:**
```json
{
  "sessionId": "session-123",
  "messages": [
    {
      "id": "msg-001",
      "type": "user",
      "content": "How do I use the blood pressure monitor?",
      "timestamp": "2025-11-09T10:30:00Z",
      "language": "en"
    },
    {
      "id": "msg-002",
      "type": "assistant",
      "content": "I'll help you use the blood pressure monitor...",
      "timestamp": "2025-11-09T10:30:15Z",
      "language": "en",
      "confidence": 0.98
    }
  ],
  "total": 24,
  "hasMore": true
}
```

### 👁️ Computer Vision API

#### Detect Medical Device
```http
POST /api/cv/detect
```

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "confidence_threshold": 0.7,
  "language": "en"
}
```

**Response:**
```json
{
  "detected": true,
  "device": {
    "id": "thermometer-ear",
    "name": "Ear Thermometer",
    "confidence": 0.94,
    "boundingBox": {
      "x": 120,
      "y": 80,
      "width": 200,
      "height": 150
    },
    "category": "temperature",
    "multilingual": {
      "en": "Ear Thermometer",
      "id": "Termometer Telinga"
    }
  },
  "alternativeDetections": [
    {
      "id": "thermometer-oral",
      "name": "Oral Thermometer",
      "confidence": 0.73
    }
  ],
  "processingTime": 1.2
}
```

### 📊 Guidance Sessions API

#### Create Guidance Session
```http
POST /api/guidance/sessions
```

**Request Body:**
```json
{
  "deviceId": "bp-monitor-digital",
  "language": "en",
  "userContext": {
    "experienceLevel": "beginner",
    "medicalConditions": []
  }
}
```

**Response:**
```json
{
  "sessionId": "guidance-session-456",
  "deviceId": "bp-monitor-digital",
  "currentStep": 1,
  "totalSteps": 8,
  "status": "active",
  "createdAt": "2025-11-09T10:35:00Z"
}
```

#### Update Session Progress
```http
PATCH /api/guidance/sessions/{sessionId}
```

**Request Body:**
```json
{
  "currentStep": 3,
  "stepCompleted": true,
  "notes": "User completed cuff placement successfully"
}
```

**Response:**
```json
{
  "sessionId": "guidance-session-456",
  "currentStep": 3,
  "totalSteps": 8,
  "progress": 0.375,
  "status": "active",
  "updatedAt": "2025-11-09T10:40:00Z"
}
```

### 🔧 System API

#### Health Check
```http
GET /api/status
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T10:45:00Z",
  "services": {
    "database": "connected",
    "chat_service": "operational",
    "cv_service": "operational",
    "sagemaker": "available"
  },
  "version": "1.0.0",
  "uptime": 86400
}
```

#### Service Configuration
```http
GET /api/config
```

**Response:**
```json
{
  "features": {
    "multilingualSupport": true,
    "computerVision": true,
    "voiceSynthesis": true,
    "realtimeChat": true
  },
  "supportedLanguages": ["en", "id", "th", "vi", "fil"],
  "supportedDevices": [
    "thermometer-oral",
    "thermometer-ear",
    "bp-monitor-digital",
    "glucose-meter"
  ],
  "limits": {
    "maxChatHistory": 100,
    "maxImageSize": 5242880,
    "sessionTimeout": 3600
  }
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (session expired)
- `404` - Not Found (resource doesn't exist)
- `422` - Validation Error (invalid data format)
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Response Format
```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The specified device ID was not found",
    "details": {
      "deviceId": "invalid-device",
      "availableDevices": ["thermometer-oral", "thermometer-ear"]
    },
    "timestamp": "2025-11-09T10:50:00Z"
  }
}
```

### Common Error Codes
- `DEVICE_NOT_FOUND` - Invalid device identifier
- `INVALID_IMAGE_FORMAT` - Unsupported image format for CV
- `SESSION_EXPIRED` - User session has expired
- `LANGUAGE_NOT_SUPPORTED` - Unsupported language code
- `CV_SERVICE_UNAVAILABLE` - Computer vision service offline
- `CHAT_SERVICE_UNAVAILABLE` - AI chat service offline
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

### Default Limits
- **Chat API**: 60 requests per minute per session
- **CV Detection**: 30 requests per minute per session
- **Device API**: 100 requests per minute per session
- **Status API**: Unlimited

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699531800
```

## WebSocket API

See [WebSocket Communication](websocket.md) for real-time chat and guidance features.

## Computer Vision Pipeline

See [Computer Vision Pipeline](computer-vision.md) for detailed CV service documentation.

---

**Last Updated**: November 2025
**API Version**: 1.0.0
**Related Documentation**: [WebSocket API](websocket.md) | [Computer Vision](computer-vision.md)