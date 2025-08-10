# SIMIS AI - Medical Device Guidance System

## Overview

SIMIS AI is a multilingual, AI-powered medical device guidance application that provides real-time assistance for using medical devices safely and effectively. The system combines computer vision for device detection, enhanced text-to-speech capabilities, and conversational AI to deliver step-by-step instructions in 10+ Southeast Asian languages. 

**Current Status**: Fully functional with support for oral thermometers, blood pressure monitors, and blood glucose meters. Features complete step navigation, enhanced TTS voice selection, formatted chat responses, and real-time AI instruction generation.

## Recent Changes (Updated: August 2025)

### Major Feature Implementations ✅
- **Step Navigation System**: Complete Previous/Next/Skip/Complete button controls with smart state management
- **Enhanced TTS Voice Selection**: Fixed male voice limitation - now properly detects and uses voices like "Microsoft George", "Google UK English Male" 
- **Rich Chat Formatting**: Numbered lists, bullet points, bold text, and proper spacing in AI responses
- **AI Response Enhancement**: Improved system prompts for better-structured, formatted guidance
- **Audio-Visual Consistency**: Synchronized audio and visual instructions (fixed previous intentional discrepancy)
- **Progress Visualization**: Step indicators showing "Step X of Y" with completion tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based architecture built with TypeScript and Vite for fast development and optimized builds. The UI leverages shadcn/ui components built on Radix UI primitives with Tailwind CSS for consistent, accessible styling. State management is handled through Zustand for global application state, while TanStack Query manages server state and API interactions. Client-side routing is implemented using Wouter for lightweight navigation.

### Backend Architecture
The backend follows a Node.js/Express architecture with TypeScript support. The server implements RESTful API endpoints for guidance session management, health checks, and real-time communication. Session data is currently managed through an in-memory storage system with plans for PostgreSQL integration using Drizzle ORM. The modular storage interface allows for easy migration from memory-based to database-backed persistence.

### AI Integration
The system integrates with OpenAI's GPT-4o model for generating contextual, multilingual guidance instructions. The AI service handles real-time translation, instruction adaptation based on user preferences (direct, gentle, detailed styles), and conversational support during device operation. Fallback mechanisms ensure functionality even without API access.

### Computer Vision System
Device detection is implemented through a simulated computer vision system that mimics real-time analysis capabilities. The system provides bounding box detection, confidence scoring, and user action recognition. This simulation layer allows for development and testing while preparing for integration with actual computer vision APIs.

### Audio System
Text-to-speech functionality is implemented using the Web Speech API with enhanced voice selection logic. The system now properly detects male and female voices by recognizing common voice names (e.g., "Microsoft George", "Google UK English Male") rather than relying on generic "male"/"female" keywords. Supports multiple languages with fallback mechanisms and comprehensive error handling. Fixed the previous limitation where only female voices were working.

### State Management
The application uses Zustand for centralized state management, handling user preferences, session data, chat history, and UI state. The store provides actions for session lifecycle management including:
- **nextStep()**: Advance to next step with completion tracking
- **previousStep()**: Navigate backwards through completed steps  
- **Session Management**: Full lifecycle control with state persistence
- **Chat History**: Formatted message storage with rich text rendering
- **Progress Tracking**: Step completion arrays and visual indicators

## External Dependencies

### AI Services
- **OpenAI API (GPT-4o)**: Powers multilingual instruction generation, real-time translation, and conversational AI features
- **Web Speech API**: Handles text-to-speech functionality with multi-language support

### Database & Storage
- **Drizzle ORM**: Database abstraction layer with PostgreSQL schema definition
- **@neondatabase/serverless**: PostgreSQL connection handling for serverless environments

### UI Components & Styling
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Pre-built component library with consistent styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development & Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across client and server
- **ESBuild**: Fast JavaScript bundler for production builds

### State & API Management
- **Zustand**: Lightweight state management for React
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimal client-side routing

### Form & Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Schema validation for type-safe data handling

### Chat & Formatting
- **Rich Text Engine**: Custom rendering for numbered lists, bullet points, and bold text
- **Message Formatting**: Enhanced AI prompts for structured response generation
- **Multilingual Chat**: Real-time translation and context-aware responses

The architecture emphasizes modularity, type safety, and scalability while maintaining performance and user experience across diverse linguistic and cultural contexts. Recent enhancements focus on user navigation control, voice accessibility, and enhanced AI-generated content formatting.