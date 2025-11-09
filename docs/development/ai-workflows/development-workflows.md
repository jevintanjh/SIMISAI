# SIMISAI Development Workflows with OpenCode/Grok Integration

## Overview

This document defines standardized development workflows for the SIMISAI medical device assistance platform, integrating OpenCode + Grok for AI-assisted development and Claude agents for specialized tasks.

## Core Development Workflow

### 1. Feature Development Workflow

#### Standard Medical Device Feature Implementation
```bash
# 1. Start OpenCode + Grok in SIMISAI workspace
opencode --model github-copilot/grok-code-fast-1 /home/runner/workspace

# 2. In OpenCode TUI, use medical device context prompts:
# "Implement [MEDICAL_DEVICE] detection in the SIMISAI computer vision pipeline"
# "Add multilingual chat support for [MEDICAL_DEVICE] guidance in the AI system"
# "Create React components for [MEDICAL_DEVICE] step-by-step instructions"

# 3. Development server workflow
pnpm run dev:full  # Start both frontend (port 5000) and backend (port 3001)

# 4. Validate implementation
pnpm run check     # TypeScript validation for medical software safety
pnpm run db:push   # Apply database schema changes for medical device data

# 5. Build and test
pnpm run build     # Production build with medical device assets
```

#### Medical Device Safety Validation
```bash
# Use Session Code Reviewer agent for medical software validation
# Agent automatically checks:
# - Medical device data handling privacy
# - API endpoint security for medical content
# - Multilingual medical content accuracy
# - Medical device detection accuracy thresholds
# - AI chat response medical appropriateness
```

### 2. Computer Vision Pipeline Development

#### Medical Device Detection Implementation
```bash
# OpenCode + Grok prompts for CV development:
opencode run --model github-copilot/grok-code-fast-1 "Analyze the SIMISAI YOLOv8 24-class medical device model and implement support for [NEW_DEVICE_TYPE]"

# Key components to implement:
# - cv-service-remote.ts: Remote CV microservice integration
# - MediaPipe integration for browser-based device detection
# - Confidence threshold validation for medical device accuracy
# - Device classification with bounding box visualization
```

#### Medical Device Model Training Workflow
```bash
# Use OpenCode + Grok for model training guidance:
opencode run --model github-copilot/grok-code-fast-1 "Guide me through updating the SIMISAI medical device detection model to include [NEW_DEVICE] with proper training data and validation"

# Training workflow:
# 1. Collect medical device images with proper consent
# 2. Annotate devices with medical accuracy requirements
# 3. Update YOLOv8 model with new device classes
# 4. Validate detection accuracy > 95% for medical safety
# 5. Deploy to cv_model/ directory and test integration
```

### 3. AI Chat Development for Medical Guidance

#### SageMaker + OpenAI Hybrid Implementation
```bash
# OpenCode + Grok integration for AI chat development:
opencode run --model github-copilot/grok-code-fast-1 "Implement medical device guidance improvements in the SIMISAI hybrid LLM service using SageMaker Sealion + OpenAI fallback"

# AI chat development workflow:
# 1. Enhance medical device context in chat prompts
# 2. Implement appropriate medical disclaimers
# 3. Add multilingual medical device terminology
# 4. Test medical device guidance accuracy
# 5. Validate chat responses are medically appropriate
```

#### WebSocket Real-time Medical Guidance
```bash
# OpenCode + Grok prompts for real-time medical guidance:
opencode run --model github-copilot/grok-code-fast-1 "Optimize the SIMISAI WebSocket chat implementation for real-time medical device guidance with low latency and high reliability"

# WebSocket development priorities:
# - Sub-second response times for medical device questions
# - Reliable connection handling for medical guidance sessions
# - Session management for medical device usage tracking
# - Error handling for critical medical guidance failures
```

### 4. Multilingual Medical Content Development

#### Medical Device Instruction Translation
```bash
# OpenCode + Grok for multilingual medical content:
opencode run --model github-copilot/grok-code-fast-1 "Implement culturally appropriate medical device instructions for SIMISAI in Indonesian, Thai, Vietnamese, and Filipino languages"

# Multilingual development workflow:
# 1. Research cultural medical device usage patterns
# 2. Translate medical terminology accurately
# 3. Validate medical instruction clarity across cultures
# 4. Test multilingual medical device guidance
# 5. Ensure medical accuracy across all languages
```

## Development Environment Configuration

### OpenCode + Grok Standard Settings
```bash
# Always use these settings for SIMISAI development:
MODEL=github-copilot/grok-code-fast-1
WORKSPACE=/home/runner/workspace
CONFIG_FILE=.opencode-config

# Standard OpenCode TUI startup:
opencode --model github-copilot/grok-code-fast-1 /home/runner/workspace

# Quick medical device development prompts:
opencode run --model github-copilot/grok-code-fast-1 "Quick medical device implementation question"
```

### Development Server Configuration
```bash
# SIMISAI development environment:
# Frontend (Astro): http://localhost:5000
# Backend (Express): http://localhost:3001
# WebSocket: ws://localhost:3001/chat-ws
# Database: PostgreSQL (local or Neon)

# Environment variables for medical device development:
DATABASE_URL="postgresql://..."          # Medical device database
CV_REMOTE_URL="https://cv-service..."    # Computer vision service
NODE_ENV="development"                   # Development mode
```

## Agent Integration Workflows

### Multi-Agent Medical Device Development
```bash
# Complex medical device feature requiring multiple agents:

# 1. Task Orchestrator coordinates the workflow
# Use: simisai-task-orchestrator for complex medical device implementations

# 2. OpenCode Developer implements features
# Use: simisai-opencode-developer for medical device code implementation

# 3. Session Code Reviewer validates medical software
# Use: simisai-session-code-reviewer for medical device safety validation

# 4. AWS Deployment Specialist handles infrastructure
# Use: simisai-aws-deployment-specialist for medical device platform deployment
```

### Medical Device Safety Validation Workflow
```bash
# Automated medical device safety checks:
# 1. Medical device detection accuracy validation
# 2. AI chat medical appropriateness review
# 3. Multilingual medical content accuracy check
# 4. Medical device data privacy compliance
# 5. Accessibility validation for medical device users
# 6. Medical device guidance safety disclaimers
```

## Quality Assurance for Medical Device Platform

### Medical Device Code Quality Standards
```bash
# Use Session Code Reviewer for medical software validation:
# - TypeScript strict mode for medical data safety
# - Medical device API endpoint security
# - Medical device database schema validation
# - Medical device chat response appropriateness
# - Medical device detection accuracy thresholds
# - Medical device multilingual content accuracy
```

### Medical Device Performance Standards
```bash
# Medical device platform performance requirements:
# - Computer vision detection: < 2 seconds response time
# - AI chat medical guidance: < 1 second response time
# - Medical device platform uptime: 99.9%
# - Medical device instruction loading: < 500ms
# - Global medical device user accessibility
```

## Advanced Development Patterns

### Medical Device Platform Integration Testing
```bash
# Use OpenCode + Grok for integration testing:
opencode run --model github-copilot/grok-code-fast-1 "Create comprehensive integration tests for SIMISAI medical device detection, AI chat, and multilingual guidance"

# Integration testing workflow:
# 1. Test CV pipeline → AI chat integration
# 2. Test medical device API → frontend integration
# 3. Test SageMaker → OpenAI fallback integration
# 4. Test multilingual → medical device content integration
# 5. Test AWS → medical device platform integration
```

### Medical Device Accessibility Development
```bash
# OpenCode + Grok for accessibility implementation:
opencode run --model github-copilot/grok-code-fast-1 "Implement accessibility features for SIMISAI medical device platform users with visual, hearing, or motor impairments"

# Accessibility development priorities:
# - Screen reader support for medical device instructions
# - Voice guidance for visual impaired users
# - Large text options for elderly medical device users
# - Motor accessibility for users with limited mobility
# - Cognitive accessibility for clear medical device guidance
```

### Medical Device Platform Monitoring
```bash
# Use AWS Deployment Specialist for monitoring setup:
# - SageMaker endpoint health for medical AI guidance
# - Lambda function performance for medical device APIs
# - RDS database performance for medical device data
# - S3/CloudFront performance for global medical device users
# - Medical device detection accuracy monitoring
# - AI chat medical guidance quality monitoring
```

## Development Best Practices

### Medical Device Safety First
- Always validate medical device detection accuracy before deployment
- Ensure AI chat responses include appropriate medical disclaimers
- Test multilingual medical content for cultural appropriateness
- Validate medical device guidance for user safety
- Implement proper error handling for medical device detection failures

### OpenCode + Grok Integration Best Practices
- Use specific medical device context in OpenCode prompts
- Reference SIMISAI documentation in OpenCode conversations
- Validate OpenCode implementations against medical software standards
- Use OpenCode for rapid prototyping of medical device features
- Leverage Grok's medical knowledge for appropriate guidance implementations

### Multi-Agent Coordination
- Use Task Orchestrator for complex medical device platform workflows
- Delegate specialized tasks to appropriate domain agents
- Ensure agent coordination maintains medical device safety standards
- Document agent decisions for medical device implementation tracking
- Validate multi-agent workflows for medical device platform integration

---

**Last Updated**: November 2025
**Applies To**: SIMISAI Medical Device Assistance Platform
**Related Documentation**: [OpenCode Setup](../docs/development/opencode-setup.md) | [Claude Agents Registry](../docs/development/claude-agents-registry.md)