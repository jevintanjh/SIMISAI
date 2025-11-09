# Gemini CLI Setup and Configuration

## Overview

Google's Gemini CLI provides direct access to Gemini AI models for research, alternative perspectives, and specialized analysis tasks within the SIMISAI medical device platform development workflow.

## Installation

### Install Gemini CLI
```bash
# Install globally via npm
npm install -g @google/gemini-cli

# Verify installation
gemini --version
```

**Current Version**: v0.13.0

## Authentication Setup

### API Key Configuration

The Gemini CLI requires a Google AI API key for authentication:

```bash
# Set environment variable (temporary)
export GEMINI_API_KEY="your-api-key-here"

# Or create configuration file (permanent)
mkdir -p ~/.gemini
echo '{"apiKey": "your-api-key-here"}' > ~/.gemini/settings.json
```

### SIMISAI Project Configuration

For the SIMISAI project, the API key is stored in Replit secrets:

```bash
# Quick setup for current session
export GEMINI_API_KEY="AIzaSyCtv2C4SLKTXh2_yt_VbSPm5eFQ7Cs_uyA"

# Test authentication
gemini "Hello, can you introduce yourself?"
```

## Usage Modes

### 1. Direct Query Mode
```bash
# Simple questions
gemini "Explain the medical device detection workflow"

# File analysis
gemini -f src/components/ui/device-detector.tsx "Review this medical device component for accessibility"

# Medical device research
gemini "Research pulse oximeter usage patterns across different age groups"
```

### 2. Interactive Mode
```bash
# Start interactive session
gemini --interactive

# Multi-turn conversation for complex analysis
# > Tell me about medical device accessibility standards
# > How can we implement voice guidance for visual impairments?
# > What are the regulatory considerations?
```

## SIMISAI-Specific Use Cases

### Medical Device Research
```bash
# Research new medical device types
gemini "Research [MEDICAL_DEVICE] usage patterns for accessibility compliance"

# Competitive analysis
gemini "Analyze competing medical device assistance platforms for feature gaps"

# Regulatory research
gemini "What are FDA guidelines for medical device software user interfaces?"
```

### Medical Content Validation
```bash
# Multilingual content review
gemini "Review this medical device instruction for cultural appropriateness in Indonesian context: [INSTRUCTION_TEXT]"

# Medical accuracy validation
gemini "Validate the medical accuracy of this blood pressure monitor guidance: [GUIDANCE_TEXT]"

# Accessibility analysis
gemini "Analyze this medical device interface for users with motor impairments: [COMPONENT_DESCRIPTION]"
```

### Alternative Implementation Perspectives
```bash
# Architecture alternatives
gemini "Suggest alternative architectures for real-time medical device chat with 99.9% uptime"

# Technology alternatives
gemini "Compare SageMaker vs Azure OpenAI for medical device guidance LLM hosting"

# Performance optimization
gemini "Suggest optimizations for computer vision detection latency in medical device pipeline"
```

## Integration with SIMISAI AI Ecosystem

### Multi-AI Workflow Coordination

Gemini CLI complements other AI assistants in the SIMISAI ecosystem:

#### **Research Phase**: Gemini CLI
- Medical device market research
- Regulatory compliance analysis
- Accessibility standards research
- Competitive feature analysis

#### **Implementation Phase**: OpenCode + Grok
- Rapid development iteration
- Code implementation
- Debugging and optimization

#### **Validation Phase**: Claude Code + Agents
- Architecture review
- Medical safety validation
- Deployment coordination

### Example Coordinated Workflow
```bash
# 1. Research with Gemini
gemini "Research thermometer types and user accessibility needs for medical device platform"

# 2. Implement with OpenCode + Grok
opencode --model github-copilot/grok-code-fast-1 "Implement thermometer detection based on Gemini research findings"

# 3. Validate with Claude Agents
# Use simisai-session-code-reviewer for medical safety validation
# Use simisai-aws-deployment-specialist for infrastructure deployment
```

## Best Practices for Medical Device Development

### Medical Safety First
- Always research medical device safety standards before implementation
- Validate medical guidance content for appropriateness
- Research accessibility requirements for medical device users
- Ensure cultural sensitivity in multilingual medical content

### Research Quality
- Use specific medical device terminology in queries
- Reference current medical device regulations (FDA, CE marking, etc.)
- Cross-reference findings with official medical device standards
- Validate research findings against peer-reviewed sources

### AI Coordination
- Use Gemini for research and analysis phases
- Delegate implementation to OpenCode + Grok
- Use Claude Agents for specialized validation and deployment
- Maintain consistency across AI assistant recommendations

## Configuration Files

### Quick Reference Configuration
```bash
# Save to .gemini-config in project root
export GEMINI_API_KEY="AIzaSyCtv2C4SLKTXh2_yt_VbSPm5eFQ7Cs_uyA"

# Usage examples:
# gemini "Research [MEDICAL_DEVICE] accessibility requirements"
# gemini -f medical-guidance.json "Validate medical appropriateness"
# gemini "Compare medical device platforms for competitive analysis"
```

### Settings File Location
```
~/.gemini/settings.json
```

## Advanced Features

### Model Options
- **Gemini 2.5 Pro**: 1M token context window for large document analysis
- **Gemini 2.5 Flash**: Faster responses for quick research queries
- **Free Tier**: 60 requests/min, 1,000 requests/day with personal Google account

### File Operations
```bash
# Analyze medical device documentation
gemini -f docs/medical-device-requirements.md "Summarize key accessibility requirements"

# Review code for medical compliance
gemini -f src/components/medical-chat.tsx "Review for medical device safety standards"

# Analyze database schemas
gemini -f shared/schema.ts "Validate medical device data schema for privacy compliance"
```

### Web Research Integration
```bash
# Research with web grounding
gemini --web "Latest FDA guidelines for medical device software 2025"

# Regulatory updates
gemini --web "Medical device accessibility standards WCAG compliance"

# Technology trends
gemini --web "AI in medical device assistance platforms trends 2025"
```

## Troubleshooting

### Common Issues

#### Authentication Errors
```bash
# Error: "Please set an Auth method"
# Solution: Verify API key is set
echo $GEMINI_API_KEY
export GEMINI_API_KEY="your-key-here"
```

#### Rate Limiting
```bash
# Error: "Rate limit exceeded"
# Solution: Use free tier limits (60 requests/min, 1000/day)
# Wait for rate limit reset or upgrade to paid tier
```

#### Model Availability
```bash
# Error: "Model not found"
# Solution: Use default Gemini Pro model
gemini --model gemini-pro "your query"
```

### Performance Optimization

#### For Large Documents
```bash
# Break large documents into sections
gemini -f section1.md "Analyze medical device requirements"
gemini -f section2.md "Analyze accessibility standards"
```

#### For Complex Research
```bash
# Use interactive mode for multi-step analysis
gemini --interactive
# > Research medical device types
# > Analyze accessibility needs
# > Suggest implementation approaches
```

---

**Integration Status**: ✅ Installed and Configured
**Last Updated**: November 2025
**Related Documentation**: [OpenCode Setup](opencode-setup.md) | [Claude Agents Registry](claude-agents-registry.md) | [AI Integration Summary](/.simisai/AI_INTEGRATION_SUMMARY.md)