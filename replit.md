# SIMIS AI - Medical Device Guidance System

## Overview

SIMIS AI is a multilingual, AI-powered medical device guidance application that provides real-time assistance for using medical devices safely and effectively. The system combines computer vision for device detection, text-to-speech capabilities, and conversational AI to deliver step-by-step instructions in 10+ Southeast Asian languages. Currently focused on oral thermometer guidance with plans to expand to blood pressure monitors and blood glucose meters.

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
Text-to-speech functionality is implemented using the Web Speech API with support for multiple languages and voice preferences (male, female, text-only). The system handles voice selection based on language and user preferences, with proper error handling and fallback mechanisms.

### State Management
The application uses Zustand for centralized state management, handling user preferences, session data, chat history, and UI state. The store provides actions for session lifecycle management, preference updates, and real-time communication features.

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

The architecture emphasizes modularity, type safety, and scalability while maintaining performance and user experience across diverse linguistic and cultural contexts.