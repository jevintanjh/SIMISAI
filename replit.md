# SIMIS AI - Medical Device Guidance System

## Overview

SIMIS AI is a multilingual medical device guidance application that provides real-time, AI-powered assistance for using medical devices. The system combines computer vision, text-to-speech, and conversational AI to guide users through device operation procedures in multiple Southeast Asian languages. 

**MVP Focus:** Oral thermometer guidance system with expansion planned for blood pressure monitors and blood glucose meters.

## User Preferences

Preferred communication style: Simple, everyday language.
Tech Stack Preference: Confirmed React-based fullstack architecture with OpenAI integration.
MVP Device: Oral thermometer only for initial implementation.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and building
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: Zustand for global state management, handling user preferences, session data, and chat messages
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management and API data fetching

### Backend Architecture
- **Server Framework**: Express.js with TypeScript running on Node.js
- **Development Setup**: Vite middleware integration for seamless development experience
- **API Design**: RESTful endpoints for guidance session management and health checks
- **Data Storage**: In-memory storage implementation with abstract interface for future database integration
- **Session Management**: Stateless session handling with unique session identifiers

### Component Architecture
- **Modular Design**: Reusable React components for camera feed, chat interface, device selection, and language selection
- **Custom Hooks**: Abstracted logic for camera access, computer vision processing, text-to-speech, and toast notifications
- **Service Layer**: Dedicated AI service for OpenAI GPT-4o integration and guidance generation

### Key Features Implementation
- **Computer Vision**: Simulated device detection system with realistic confidence scores and user action tracking
- **Multilingual Support**: 10 Southeast Asian languages with native script support and localized device instructions
- **Text-to-Speech**: Browser-based speech synthesis with voice preference selection (male/female/text-only)
- **Real-time Guidance**: Step-by-step instruction generation with corrective feedback based on user actions
- **Chat Interface**: Conversational AI assistant for answering user questions during device operation

### Data Schema Design
- **Type Safety**: Zod schemas for runtime validation of device types, languages, guidance styles, and session data
- **Session Management**: Comprehensive session tracking with progress indicators, completion status, and user feedback
- **Device Instructions**: Structured data for device-specific step-by-step procedures and metadata

## External Dependencies

### Core Dependencies
- **AI Integration**: OpenAI SDK for GPT-4o model integration and natural language processing
- **Database**: Drizzle ORM with PostgreSQL support (configured for @neondatabase/serverless)
- **Authentication**: Framework prepared for session-based authentication using connect-pg-simple

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with custom design system and dark theme support
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production bundling and TypeScript compilation
- **Development Environment**: Replit-specific plugins for cartographer and runtime error handling

### Runtime Services
- **Media Access**: Browser MediaDevices API for camera access and video streaming
- **Speech Synthesis**: Web Speech API for text-to-speech functionality
- **State Persistence**: Browser localStorage for user preference persistence

### Deployment Considerations
- **Database Migration**: Drizzle-kit for database schema management and migrations
- **Environment Configuration**: Support for development and production environments with appropriate service configurations
- **Static Asset Serving**: Express static file serving for production builds