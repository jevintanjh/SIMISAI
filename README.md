# SIMIS AI - Medical Device Guidance System

A multilingual, AI-powered medical device guidance application that provides real-time assistance for using medical devices. The system combines computer vision, text-to-speech, and conversational AI to guide users through device operation procedures in multiple Southeast Asian languages.

![SIMIS AI Demo](attached_assets/image_1754807445808.png)

## 🌟 Features

- **Smart Device Detection**: AI-powered computer vision recognizes medical devices using your camera
- **Multilingual Support**: Available in 10+ Southeast Asian languages with native voice support
- **Real-time Guidance**: Step-by-step instructions with corrective feedback
- **Interactive Chat**: Conversational AI assistant for answering questions during device operation
- **Voice Options**: Choose between male, female, or text-only guidance
- **Personalized Experience**: Select from direct, gentle, or detailed instruction styles

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/simis-ai.git
   cd simis-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5000`

## 🏗️ Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **State Management**: Zustand for global state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Server Framework**: Express.js with TypeScript running on Node.js
- **Development Setup**: Vite middleware integration for seamless development
- **API Design**: RESTful endpoints for guidance session management
- **Data Storage**: In-memory storage with abstract interface for future database integration
- **Session Management**: Stateless session handling with unique session identifiers

### Key Technologies
- **AI Integration**: OpenAI SDK for GPT-4o model integration
- **Computer Vision**: Simulated device detection system with realistic confidence scores
- **Text-to-Speech**: Browser-based speech synthesis with Web Speech API
- **Database**: Drizzle ORM with PostgreSQL support (configured for @neondatabase/serverless)
- **Styling**: Tailwind CSS with custom design system and dark theme support

## 🎯 MVP Focus

**Current Implementation**: Oral thermometer guidance system
**Planned Expansion**: Blood pressure monitors and blood glucose meters

## 📱 How It Works

1. **Select Your Device**: Choose from thermometer, blood pressure monitor, or glucose meter
2. **Pick Your Language**: Available in 10+ Southeast Asian languages with native voice support
3. **Start Guidance**: Follow real-time instructions with your camera active

### Core Features Implementation
- **Computer Vision**: Simulated device detection system with user action tracking
- **Multilingual Support**: Native script support and localized device instructions
- **Real-time Guidance**: Step-by-step instruction generation with corrective feedback
- **Chat Interface**: Conversational AI assistant for device operation questions

## 🛠️ Development

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Application pages
│   │   ├── store/         # Zustand state management
│   │   └── lib/           # Utility functions and services
├── server/                # Backend Express application
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage interface
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas for type validation
└── attached_assets/       # Static assets and images
```

### Key Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally

### Data Schema Design
- **Type Safety**: Zod schemas for runtime validation of device types, languages, and session data
- **Session Management**: Comprehensive session tracking with progress indicators
- **Device Instructions**: Structured data for device-specific procedures and metadata

## 🌐 Deployment Considerations

- **Database Migration**: Drizzle-kit for database schema management and migrations
- **Environment Configuration**: Support for development and production environments
- **Static Asset Serving**: Express static file serving for production builds

## 🔧 External Dependencies

### Core Dependencies
- **AI Integration**: OpenAI SDK for natural language processing
- **Database**: Drizzle ORM with PostgreSQL support
- **Authentication**: Framework prepared for session-based authentication

### UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography

### Runtime Services
- **Media Access**: Browser MediaDevices API for camera access
- **Speech Synthesis**: Web Speech API for text-to-speech functionality
- **State Persistence**: Browser localStorage for user preferences

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for better healthcare accessibility