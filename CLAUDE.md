# SIMISAI - Medical Device Assistant App

## Overview
SIMISAI is a React-based medical device assistant application that provides real-time guided instructions for using various medical devices like blood pressure monitors and glucose meters. The app uses computer vision for device detection, offers multilingual support, and includes an AI-powered chat system for real-time assistance.

## Project Structure

```
/Users/raymondharrison/Desktop/SIMISAI/
├── client/src/               # Frontend React application
│   ├── components/          # React components
│   │   └── ui/             # Shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── server/                  # Backend Express.js server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes & WebSocket
│   ├── storage.ts          # Database layer
│   ├── cv-service*.ts      # Computer vision services
│   └── vite.ts             # Vite integration
├── shared/                  # Shared code between client/server
│   └── schema.ts           # Database schema & types
├── cv_model/               # Computer vision Python model
│   ├── app.py              # Gradio/FastAPI interface
│   ├── models/             # Trained models
│   └── data/               # Training data
├── config/                 # Configuration files
├── dist/                   # Production build output
├── attached_assets/        # Static assets
└── scripts/                # Build and utility scripts
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS 3.4.17 with custom CSS variables
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time**: WebSocket server for chat functionality
- **Authentication**: Session-based (no explicit user auth currently)

### Database
- **Primary**: PostgreSQL with Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations
- **Fallback**: In-memory storage for development

### Computer Vision
- **Model**: YOLOv8 for medical device detection
- **Deployment Options**:
  - Local Python model (cv_model/models/poc2/best.pt)
  - Hugging Face Spaces integration
  - Remote Docker service (dockercv.onrender.com)

## Key Entry Points

### Frontend Entry Points
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/main.tsx` - React application bootstrap
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/App.tsx` - Main app component with routing
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/pages/welcome.tsx` - Welcome/onboarding page
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/pages/guidance.tsx` - Main guidance interface
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/pages/home.tsx` - Home/dashboard page

### Backend Entry Points
- `/Users/raymondharrison/Desktop/SIMISAI/server/index.ts` - Express server bootstrap
- `/Users/raymondharrison/Desktop/SIMISAI/server/routes.ts` - API routes and WebSocket setup
- `/Users/raymondharrison/Desktop/SIMISAI/server/storage.ts` - Database operations layer

### Configuration Entry Points
- `/Users/raymondharrison/Desktop/SIMISAI/vite.config.ts` - Frontend build configuration
- `/Users/raymondharrison/Desktop/SIMISAI/drizzle.config.ts` - Database configuration
- `/Users/raymondharrison/Desktop/SIMISAI/shared/schema.ts` - Database schema definitions

## Development Workflow

### Package Management
- **Package Manager**: npm
- **Dependencies**: Managed via package.json and package-lock.json
- **Node Modules**: Installed in `/Users/raymondharrison/Desktop/SIMISAI/node_modules/`

### Development Scripts
```bash
# Development (Full Stack)
npm run dev:full          # Concurrent backend + frontend
npm run dev:mac           # Backend only (macOS optimized)
npm run dev:vite          # Frontend only
npm run dev               # Backend only (standard)

# Build & Production
npm run build             # Build frontend + backend
npm start                 # Start production server
npm run check             # TypeScript type checking

# Database
npm run db:push           # Push schema changes to database
```

### Development Servers
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:3001 (Express server)
- **WebSocket**: ws://localhost:3001/chat-ws
- **API**: http://localhost:3001/api/*

### Build Process
1. **Frontend**: Vite builds React app to `/Users/raymondharrison/Desktop/SIMISAI/dist/public/`
2. **Backend**: ESBuild bundles server code to `/Users/raymondharrison/Desktop/SIMISAI/dist/index.js`
3. **Production**: Single server serves both frontend and API

## Architecture Patterns

### Frontend Architecture
- **Component-Based**: React functional components with hooks
- **State Management**: React Query for server state, React state for UI
- **Type Safety**: Full TypeScript coverage with strict mode
- **UI System**: Shadcn/ui for consistent design system
- **Responsive Design**: Mobile-first with Tailwind CSS

### Backend Architecture
- **RESTful API**: Express.js with typed routes
- **WebSocket Integration**: Real-time chat functionality
- **Database Layer**: Drizzle ORM with typed queries
- **Service Layer**: Separate CV services for different deployment modes
- **Error Handling**: Centralized error middleware

### Data Models
```typescript
// Key database tables
- devices: Medical device catalog
- instructions: Step-by-step guidance with translations
- chatMessages: AI assistant conversations
- guidanceSessions: User progress tracking
```

### CV Service Architecture
The computer vision service supports multiple deployment modes:
- **Local**: Python model running locally
- **Remote**: External Docker service
- **HF Spaces**: Hugging Face Spaces deployment

## Key Features & Components

### Core Features
- **Device Detection**: Camera-based medical device recognition
- **Multi-language Support**: English, Indonesian, Thai, Vietnamese, Filipino
- **Voice Instructions**: Text-to-speech guidance
- **Real-time Chat**: AI assistant for help and questions
- **Progress Tracking**: Step-by-step guidance sessions
- **Responsive Design**: Mobile-first interface

### Custom Hooks
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/hooks/use-camera.tsx` - Camera access and management
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/hooks/use-mediapipe-camera.tsx` - MediaPipe integration
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/hooks/use-voice.tsx` - Text-to-speech functionality
- `/Users/raymondharrison/Desktop/SIMISAI/client/src/hooks/use-websocket.tsx` - WebSocket connection management

### UI Components
- Comprehensive Shadcn/ui component library
- Custom medical device components
- Camera interface components
- Chat interface components

## Environment Configuration

### Environment Variables
```bash
# Core Configuration
NODE_ENV=development
PORT=3001

# Database (Optional - falls back to in-memory)
DATABASE_URL=your_database_url_here

# CV Service Options (Pick one)
CV_REMOTE_URL=https://dockercv.onrender.com    # Remote Docker service (preferred)
HF_SPACES_URL=your_hf_space_url                # Hugging Face Spaces
# (Leave both unset for local Python model)

# Optional
SESSION_SECRET=your_session_secret_here
SEALION_API_KEY=your_sealion_api_key_here
SEALION_API_URL=your_sealion_api_url_here
```

### Configuration Files
- `/Users/raymondharrison/Desktop/SIMISAI/.env` - Environment variables
- `/Users/raymondharrison/Desktop/SIMISAI/components.json` - Shadcn/ui configuration
- `/Users/raymondharrison/Desktop/SIMISAI/tailwind.config.ts` - Tailwind CSS configuration
- `/Users/raymondharrison/Desktop/SIMISAI/tsconfig.json` - TypeScript configuration
- `/Users/raymondharrison/Desktop/SIMISAI/postcss.config.js` - PostCSS configuration

## Testing Setup
- **Type Checking**: TypeScript strict mode enabled
- **Build Testing**: `npm run check` for type validation
- **Test Exclusions**: `**/*.test.ts` files excluded from build
- **No formal test framework currently configured**

## Development Tools & Integrations

### Replit Integration
- `.replit` configuration for Replit development environment
- Vite plugins for Replit integration
- Runtime error modal for development debugging

### macOS Development Support
- Optimized localhost configuration for macOS
- IPv4/IPv6 compatibility handling
- Port conflict resolution
- Camera access optimization for local development

## Documentation Files

### Setup & Deployment
- `/Users/raymondharrison/Desktop/SIMISAI/README.md` - Main project documentation
- `/Users/raymondharrison/Desktop/SIMISAI/DEPLOYMENT.md` - Comprehensive deployment guide
- `/Users/raymondharrison/Desktop/SIMISAI/MACOS-LOCALHOST-SETUP.md` - macOS development setup
- `/Users/raymondharrison/Desktop/SIMISAI/README-MAC-DEV.md` - macOS development guide
- `/Users/raymondharrison/Desktop/SIMISAI/replit.md` - Replit deployment instructions

### Computer Vision
- `/Users/raymondharrison/Desktop/SIMISAI/cv_model/README.md` - CV model documentation
- `/Users/raymondharrison/Desktop/SIMISAI/setup-cv.sh` - CV model setup script

## Database Schema

### Key Tables
```typescript
// Devices table - Medical equipment catalog
devices: {
  id: string (UUID)
  name: string
  type: string  // "bp_monitor", "glucose_meter", etc.
  stepCount: number
  isActive: boolean
  imageUrl?: string
  description?: string
}

// Instructions table - Step-by-step guidance
instructions: {
  id: string (UUID)
  deviceId: string (FK)
  stepNumber: number
  title: string
  description: string
  translations: Record<string, {title: string, description: string}>
  audioUrl?: string
  imageUrl?: string
  checkpoints?: string[]
}

// Chat messages - AI assistant conversations
chatMessages: {
  id: string (UUID)
  sessionId: string
  message: string
  isUser: boolean
  language: string
  timestamp: string
}

// Guidance sessions - User progress tracking
guidanceSessions: {
  id: string (UUID)
  deviceId: string (FK)
  currentStep: number
  language: string
  startedAt: string
  completedAt?: string
  isCompleted: boolean
}
```

## Deployment Options

### Development
1. **Full Local**: Frontend (3000) + Backend (3001) + Local CV model
2. **Hybrid**: Local frontend/backend + Remote CV service
3. **Replit**: Complete development environment in browser

### Production
1. **Microservices**: Frontend (Vercel) + Backend (Railway/Render) + CV (HF Spaces)
2. **Monolith**: Full-stack deployment (Railway/Render/DigitalOcean)
3. **Docker**: Containerized deployment with CV service

### Recommended Production Setup
- **Frontend**: Vercel deployment
- **Backend**: Railway or Render
- **CV Service**: Docker service at dockercv.onrender.com
- **Database**: Neon Database (PostgreSQL)

## Quick Start for New Claude Instances

1. **Understanding the codebase**:
   - This is a medical device guidance app with React frontend and Express backend
   - Uses computer vision for device detection and AI chat for assistance
   - Supports multiple deployment modes for the CV service

2. **Key development commands**:
   ```bash
   npm run dev:full    # Start both frontend and backend
   npm run build       # Build for production
   npm run db:push     # Update database schema
   ```

3. **Important paths to know**:
   - Client code: `/Users/raymondharrison/Desktop/SIMISAI/client/src/`
   - Server code: `/Users/raymondharrison/Desktop/SIMISAI/server/`
   - Database schema: `/Users/raymondharrison/Desktop/SIMISAI/shared/schema.ts`

4. **Common tasks**:
   - Adding new UI components: Use Shadcn/ui patterns in `client/src/components/ui/`
   - Adding API endpoints: Modify `/Users/raymondharrison/Desktop/SIMISAI/server/routes.ts`
   - Database changes: Update `/Users/raymondharrison/Desktop/SIMISAI/shared/schema.ts` and run `npm run db:push`
   - Adding new pages: Create in `client/src/pages/` and update routing in `App.tsx`

5. **Environment setup**:
   - Copy `.env` file and set required variables
   - Ensure PostgreSQL database or use in-memory fallback
   - Configure CV service (local, remote, or HF Spaces)

This codebase follows modern React and Node.js patterns with TypeScript throughout. The architecture is designed for scalability with clear separation between frontend, backend, and computer vision services.