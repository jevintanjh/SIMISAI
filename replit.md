# Medical Device Assistant App

## Overview

This is a React-based medical device assistant application that provides real-time guided instructions for using various medical devices like blood pressure monitors and glucose meters. The app uses computer vision for device detection, offers multilingual support, and includes an AI-powered chat system for real-time assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with WebSocket support for real-time features
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket server for chat functionality

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Models**: 
  - Devices (medical equipment catalog)
  - Instructions (step-by-step guidance with translations)
  - Chat Messages (AI assistant conversations)
  - Guidance Sessions (user progress tracking)
- **Fallback Storage**: In-memory storage implementation for development

### Authentication and Authorization
- **Session-based Authentication**: Using Express sessions
- **Session Store**: PostgreSQL-backed session storage via connect-pg-simple
- **No explicit auth implementation**: Currently relies on session management without user authentication

### Mobile-First Design
- **Responsive Design**: Mobile-first approach with desktop breakpoints
- **PWA Features**: Optimized for mobile devices with camera access
- **Touch Interface**: Gesture-friendly UI components
- **Offline Considerations**: Local state management for core functionality

### Real-time Features
- **Camera Integration**: Browser MediaDevices API for device detection
- **Voice Synthesis**: Web Speech API for audio instructions
- **WebSocket Chat**: Real-time AI assistant communication
- **Progress Tracking**: Live step-by-step guidance updates

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Database toolkit and ORM
- **connect-pg-simple**: PostgreSQL session store

### UI and Styling
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: CSS-in-JS variant management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and compilation
- **ESBuild**: Production bundling
- **Replit Integration**: Development environment plugins

### Real-time Communication
- **WebSocket (ws)**: Real-time bidirectional communication
- **TanStack Query**: Server state synchronization

### Browser APIs
- **MediaDevices API**: Camera access for device detection
- **Web Speech API**: Text-to-speech for voice instructions
- **WebSocket API**: Real-time communication

### Internationalization
- **Built-in Translation System**: Custom implementation for multi-language support
- **Supported Languages**: English, Indonesian, Thai, Vietnamese, Filipino
- **Date Utilities**: date-fns for localized date formatting

### Form Management
- **React Hook Form**: Form state management
- **Zod**: Schema validation with Drizzle integration
- **Hookform Resolvers**: Integration between React Hook Form and validation schemas