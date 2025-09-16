# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SIMIS AI is a React-based medical device assistant application with computer vision capabilities for device detection. The app provides real-time guided instructions for using medical devices like blood pressure monitors and glucose meters, with multilingual support and an AI-powered chat system.

## Development Commands

### Core Development
- `npm run dev` - Start backend server only (Node.js/Express on port 3001)
- `npm run dev:vite` - Start frontend only (Vite dev server on port 3000)
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run dev:mac` - Backend with explicit port 3001 for macOS

### Build and Deployment
- `npm run build` - Build frontend (Vite) and backend (ESBuild)
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

### Database
- `npm run db:push` - Push Drizzle schema changes to database

## Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state
- **UI**: Shadcn/ui components (Radix UI + Tailwind CSS)
- **Build Tool**: Vite with TypeScript support

### Backend (Server)
- **Runtime**: Node.js with Express.js and ES modules
- **WebSocket**: Real-time chat functionality on `/chat-ws` endpoint
- **Database**: PostgreSQL with Drizzle ORM
- **Session Store**: PostgreSQL-backed sessions via connect-pg-simple

### Computer Vision Integration
The system supports multiple CV backends via environment variables:
1. **Remote CV Service** (preferred): Set `CV_REMOTE_URL`
2. **Hugging Face Spaces**: Set `HF_SPACES_URL` 
3. **Local Python Model**: Default fallback

### Database Schema
Located in `shared/schema.ts` with main tables:
- `devices` - Medical device catalog
- `instructions` - Step-by-step guidance with translations
- `chatMessages` - AI assistant conversations
- `guidanceSessions` - User progress tracking

## Key Directories

```
client/src/
├── components/     # UI components including camera, chat, navigation
├── pages/         # Main application pages (welcome, guidance, home)
├── lib/           # Utilities and query client setup
└── hooks/         # Custom React hooks

server/
├── index.ts       # Main server entry point
├── routes.ts      # API routes and WebSocket setup
├── storage.ts     # Database abstraction layer
└── cv-service*.ts # Computer vision service implementations

shared/
└── schema.ts      # Shared database schema and types
```

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (required for Drizzle)
- `NODE_ENV` - development/production mode
- `PORT` - Server port (default: 3001)

Optional CV service configuration:
- `CV_REMOTE_URL` - Remote CV microservice endpoint (preferred)
- `HF_SPACES_URL` - Hugging Face Spaces endpoint (fallback)

## Development Workflow

1. **Local Development**: Use `npm run dev:full` to start both servers
2. **Frontend Only**: Use `npm run dev:vite` for UI development
3. **Backend Only**: Use `npm run dev` for API development
4. **Type Checking**: Run `npm run check` before commits
5. **Database Changes**: Use `npm run db:push` to sync schema changes

## Key Features

- **Multilingual Support**: Built-in translation system (EN, ID, TH, VI, FIL)
- **Real-time Chat**: WebSocket-based AI assistant
- **Camera Integration**: MediaDevices API for device detection
- **Voice Instructions**: Web Speech API for audio guidance
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Session Management**: PostgreSQL-backed user sessions

## Testing and Linting

This project does not include explicit test or lint commands in package.json. Check for any additional configuration files or ask the user for the preferred testing/linting approach.

## Deployment

The application supports microservice deployment with separate frontend and CV model services. See `DEPLOYMENT.md` for detailed deployment instructions including Vercel, Hugging Face Spaces, Railway, and Render options.