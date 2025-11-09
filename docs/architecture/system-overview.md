# SIMISAI System Overview

## Project Mission

SIMISAI is an AI-powered medical device guidance platform that provides real-time, multilingual assistance for using medical devices like thermometers, blood pressure monitors, and glucose meters. The system combines computer vision for device detection with AI chat assistance to guide users through proper device usage.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Astro+React) │◄──►│   (Express.js)  │◄──►│   (AWS ML)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3 Static     │    │   PostgreSQL    │    │   SageMaker     │
│   Hosting       │    │   Database      │    │   (Sealion LLM) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Frontend Stack
- **Framework**: Astro 5 (Static Site Generator)
- **UI Components**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query for server state
- **Build Tool**: Astro build system with Vite
- **Deployment**: AWS S3 static website hosting

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with PostgreSQL store
- **Real-time**: WebSocket server for chat functionality
- **Deployment**: AWS Lambda functions

### AI & Machine Learning
- **Computer Vision**: MediaPipe + Custom YOLOv8 model (24 device classes)
- **Language Model**: Sealion 27B LLM via AWS SageMaker
- **Fallback LLM**: OpenAI GPT-4 for hybrid service
- **CV Service**: Remote microservice with fallback options

### Infrastructure (AWS)
- **Compute**: Lambda functions for serverless backend
- **Storage**: RDS PostgreSQL + S3 for static assets
- **ML Platform**: SageMaker for LLM inference
- **Networking**: API Gateway + CloudFront CDN
- **Monitoring**: CloudWatch for logs and metrics

## Core Features

### 1. Computer Vision Device Detection
- **Real-time Detection**: Browser camera integration via MediaDevices API
- **Device Recognition**: 24 medical device classes (thermometers, BP monitors, glucose meters)
- **Model**: Custom YOLOv8 trained on medical device dataset
- **Deployment**: Remote CV microservice with local Python fallback

### 2. AI-Powered Guidance
- **Interactive Chat**: Real-time AI assistance via WebSocket
- **Hybrid LLM**: Primary Sealion 27B + OpenAI GPT-4 fallback
- **Context-Aware**: Device-specific guidance based on detected equipment
- **Step-by-Step**: Progressive instruction delivery

### 3. Multilingual Support
- **Languages**: English, Indonesian, Thai, Vietnamese, Filipino
- **Real-time Translation**: Built-in translation system
- **Localized Content**: Device instructions in all supported languages
- **Voice Synthesis**: Web Speech API for audio instructions

### 4. Progressive Web App (PWA)
- **Mobile-First**: Responsive design optimized for mobile devices
- **Offline Capabilities**: Local state management for core functionality
- **Camera Access**: Native browser camera integration
- **Performance**: Optimized loading and caching strategies

## Data Flow

### User Interaction Flow
1. **Device Detection**: User points camera at medical device
2. **CV Processing**: Device recognized and classified via ML model
3. **Instruction Retrieval**: Device-specific guidance fetched from database
4. **AI Assistance**: Real-time chat support via WebSocket connection
5. **Progress Tracking**: User progress monitored and stored

### API Communication Flow
```
Frontend → API Gateway → Lambda Functions → RDS/SageMaker
    ↓           ↓              ↓               ↓
WebSocket ← Express.js ← Business Logic ← Data Layer
```

## Security & Performance

### Security Measures
- **HTTPS**: SSL/TLS encryption for all communications
- **Session Management**: Secure session storage in PostgreSQL
- **Input Validation**: Zod schema validation throughout
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: API throttling and abuse prevention

### Performance Optimizations
- **Static Generation**: Astro SSG for fast initial page loads
- **CDN Distribution**: CloudFront for global content delivery
- **Database Optimization**: Drizzle ORM with efficient queries
- **Serverless Architecture**: Auto-scaling Lambda functions
- **Image Optimization**: Optimized medical device training dataset

## Deployment Architecture

### Production Environment
- **Frontend**: S3 static hosting + CloudFront CDN
- **Backend**: Lambda functions behind API Gateway
- **Database**: RDS PostgreSQL with automated backups
- **AI Services**: SageMaker endpoints for ML inference
- **Monitoring**: CloudWatch dashboards and alerts

### Development Environment
- **Local Server**: Express.js on port 3001
- **Frontend Dev**: Astro dev server on port 5000
- **Database**: Local PostgreSQL or Neon Database
- **Hot Reload**: Automatic reload for development efficiency

## Integration Points

### External Services
- **AWS SageMaker**: Sealion LLM inference
- **OpenAI API**: Fallback language model
- **MediaPipe**: Computer vision processing
- **Neon Database**: Serverless PostgreSQL hosting

### Internal Modules
- **CV Service**: Device detection and classification
- **Chat Service**: Real-time AI conversation
- **Guidance Engine**: Step-by-step instruction delivery
- **Session Manager**: User state and progress tracking

## Scalability Considerations

### Current Capacity
- **Concurrent Users**: Supports hundreds of simultaneous users
- **Database**: PostgreSQL with connection pooling
- **Lambda**: Auto-scaling based on demand
- **SageMaker**: Real-time inference endpoint

### Growth Strategy
- **Horizontal Scaling**: Additional Lambda functions and RDS read replicas
- **Content Delivery**: Global CloudFront distribution
- **Caching**: Redis for frequently accessed data
- **Load Balancing**: Application Load Balancer for high availability

---

**Last Updated**: November 2025
**Next Review**: December 2025
**Related Documentation**: [Frontend Architecture](frontend-architecture.md) | [Backend Architecture](backend-architecture.md)