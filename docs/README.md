# SIMISAI Documentation

Welcome to the SIMISAI Medical Device Assistant documentation. This directory contains comprehensive documentation for developers, AI assistants, and system administrators.

## 📚 Documentation Structure

### 🏗️ [Architecture](/docs/architecture/)
System design, technical architecture, and component relationships
- **[System Overview](/docs/architecture/system-overview.md)** - High-level architecture and tech stack
- **[Frontend Architecture](/docs/architecture/frontend-architecture.md)** - Astro + React implementation details
- **[Backend Architecture](/docs/architecture/backend-architecture.md)** - Express.js + PostgreSQL design
- **[Database Schema](/docs/architecture/database-schema.md)** - Data models and relationships

### 🚀 [Deployment](/docs/deployment/)
Infrastructure setup, deployment procedures, and production management
- **[AWS Infrastructure](/docs/deployment/aws-infrastructure.md)** - Complete AWS resource inventory and status
- **[Local Development](/docs/deployment/local-development.md)** - Development environment setup
- **[Production Deployment](/docs/deployment/production-deployment.md)** - Deployment procedures and checklist
- **[Troubleshooting](/docs/deployment/troubleshooting.md)** - Common issues and solutions

### 🔌 [API Reference](/docs/api/)
Backend services, endpoints, and integration details
- **[REST Endpoints](/docs/api/endpoints.md)** - Complete API reference with examples
- **[WebSocket Communication](/docs/api/websocket.md)** - Real-time chat and guidance features
- **[Computer Vision Pipeline](/docs/api/computer-vision.md)** - CV service integration and usage

### 👨‍💻 [Development](/docs/development/)
Developer workflows, guidelines, and best practices
- **[Getting Started](/docs/development/getting-started.md)** - Quick start guide for new developers
- **[OpenCode + Grok Setup](/docs/development/opencode-setup.md)** - AI coding assistant configuration
- **[Gemini CLI Setup](/docs/development/gemini-cli-setup.md)** - Google Gemini AI research assistant
- **[Claude Agents Registry](/docs/development/claude-agents-registry.md)** - Specialized AI agents for complex tasks
- **[Coding Guidelines](/docs/development/coding-guidelines.md)** - Code standards and conventions
- **[Testing](/docs/development/testing.md)** - Testing procedures and frameworks
- **[Contributing](/docs/development/contributing.md)** - Team collaboration and git workflow

### 🤖 [AI-Assisted Workflows](/.simisai/)
Advanced AI integration for development and deployment
- **[Development Workflows](/.simisai/development-workflows.md)** - OpenCode + Grok integration patterns
- **[Deployment Workflows](/.simisai/deployment-workflows.md)** - AI-assisted deployment automation

### 📦 [Archived Documentation](/docs/archived/)
Historical documentation and legacy information
- **[Session Handoffs](/docs/archived/session-handoffs/)** - AWS deployment sessions and architect handoffs
- **[Feature Development](/docs/archived/feature-development/)** - Historical development documentation

## 🤖 Quick Start for AI Assistants

### For New AI Assistants (Gemini, OpenCode CLI, etc.)
1. **Start Here**: Read [System Overview](/docs/architecture/system-overview.md) for project context
2. **Current Status**: Check [AWS Infrastructure](/docs/deployment/aws-infrastructure.md) for deployment status
3. **Development**: Reference [Getting Started](/docs/development/getting-started.md) for environment setup
4. **AI Setup**: Configure [OpenCode + Grok](/docs/development/opencode-setup.md) for coding assistance
5. **Advanced AI**: Use [Claude Agents](/docs/development/claude-agents-registry.md) for specialized tasks
6. **API Integration**: Review [REST Endpoints](/docs/api/endpoints.md) for backend services

### 🤖 Multi-AI Assistant Ecosystem
- **Claude Code**: Primary architecture & complex development (you are here)
- **OpenCode + Grok**: Secondary coding assistance & quick development tasks
- **Claude Agents**: Specialized domain experts (AWS deployment, medical validation, etc.)
- **Gemini CLI**: Research & alternative perspectives (✅ configured)

### Key Project Information
- **Tech Stack**: Astro 5 + React 18 frontend, Express.js + PostgreSQL backend
- **Cloud Infrastructure**: AWS (SageMaker, Lambda, RDS, S3, API Gateway)
- **AI Features**: Computer vision device detection, multilingual chat assistance
- **Current Branch**: `CVFix` (production-ready with containerization)
- **AI Workflows**: Integrated OpenCode/Grok + Claude Agents for comprehensive development

## 🎯 Project Status Summary

### ✅ Operational
- Frontend deployed on S3 static hosting
- SageMaker endpoint running (Sealion 27B LLM)
- RDS PostgreSQL database available
- 19 Lambda functions deployed

### 🔄 In Progress
- Frontend-backend API integration
- Hybrid LLM service (OpenAI + Sealion)
- CloudFormation infrastructure recreation

### 📊 Deployment URLs
- **Frontend**: http://simisai-frontend-1758031227.s3-website-us-east-1.amazonaws.com/
- **API Gateway**: simisai-api (2e7j2vait1)
- **Database**: simisai-production-db (PostgreSQL)

## 🔍 Navigation Tips

- **Documentation Search**: Use Ctrl+F to search within documentation files
- **Cross-References**: Follow internal links to related documentation
- **Historical Context**: Check archived documentation for implementation decisions
- **Current Status**: Always refer to deployment documentation for latest infrastructure status

---

**Last Updated**: November 2025
**Maintained By**: SIMISAI Development Team
**For Support**: Reference [Troubleshooting](/docs/deployment/troubleshooting.md) or [Contributing](/docs/development/contributing.md)