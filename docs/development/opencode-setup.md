# OpenCode CLI Setup and Configuration

## Overview

OpenCode CLI is an AI-powered terminal assistant that provides coding help, debugging, and development guidance. This document covers the complete setup and configuration for the SIMISAI project.

## Installation

### Install OpenCode CLI
```bash
# Install globally via npm
npm install -g opencode-ai@latest

# Verify installation
opencode --version
```

**Current Version**: v1.0.51

## Free Model Configuration

### Available Free Models
OpenCode provides access to several free models through GitHub Copilot integration:

#### **Grok Models (Recommended)**
- `github-copilot/grok-code-fast-1` ✅ **Currently configured**
- `github-copilot/grok-3-mini`

#### **Other Free Models**
- `github-copilot/claude-haiku-4.5`
- `github-copilot/gpt-5-mini`
- `github-copilot/gemini-2.5-pro`
- `github-models/xai/grok-3`
- `github-models/xai/grok-3-mini`

### Authentication Setup

#### GitHub Integration (No Additional Auth Required)
OpenCode automatically uses available GitHub tokens for free models:
```bash
# Check available authentication providers
opencode auth list

# GitHub token is detected automatically from environment
echo $GITHUB_TOKEN  # Should show: github_pat_11BRNZFGA02MPTqdnJZbaF_...
```

## Usage Modes

### 1. Interactive TUI Mode (Recommended)
Start the Terminal User Interface for interactive conversations:

```bash
# Start OpenCode with Grok in SIMISAI workspace
opencode --model github-copilot/grok-code-fast-1 /home/runner/workspace

# Alternative: Start with default settings and switch model in TUI
opencode /home/runner/workspace
```

**TUI Keyboard Shortcuts:**
- **Ctrl+P**: Open commands menu
- **Ctrl+X L**: List all sessions
- **Ctrl+X M**: Switch between models
- **Tab**: Switch between agents
- **Ctrl+C**: Exit OpenCode

### 2. One-Shot Command Mode
Execute single commands without starting TUI:

```bash
# Ask a specific question
opencode run --model github-copilot/grok-code-fast-1 "How do I fix the AWS SageMaker model archive issue?"

# Code analysis
opencode run --model github-copilot/grok-code-fast-1 "Explain the WebSocket implementation in server/routes.ts"

# Debug assistance
opencode run --model github-copilot/grok-code-fast-1 "Help me troubleshoot the frontend-backend API integration"
```

### 3. Continue Previous Sessions
```bash
# Continue the last session
opencode --continue

# Continue a specific session by ID
opencode --session <session-id>
```

## Configuration Files

### Authentication Storage
```bash
# Credentials stored at:
~/.local/share/opencode/auth.json

# Log files location:
~/.local/share/opencode/log/
```

### Environment Variables
```bash
# Required for GitHub models (automatically available)
GITHUB_TOKEN=github_pat_11BRNZFGA02MPTqdnJZbaF_...

# Optional: AWS credentials for Bedrock models
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
```

## SIMISAI Project Integration

### Recommended Workflow
1. **Start in Project Root**:
   ```bash
   cd /home/runner/workspace
   opencode --model github-copilot/grok-code-fast-1 .
   ```

2. **Common Use Cases**:
   - **Architecture Questions**: "Explain the Astro + React frontend structure"
   - **AWS Deployment**: "Help me fix the CloudFormation stack issues"
   - **API Development**: "Review the REST endpoints in server/routes.ts"
   - **Database Schema**: "Analyze the Drizzle schema definitions"
   - **Frontend Components**: "Optimize the React components for performance"

### Context-Aware Prompts
OpenCode with Grok works best with specific, contextual prompts:

```bash
# Instead of: "Fix my code"
# Use: "Help me fix the SageMaker endpoint model archive extraction error in aws-deployment/"

# Instead of: "Optimize my app"
# Use: "Review the WebSocket chat implementation in server/routes.ts for performance improvements"

# Instead of: "Add a feature"
# Use: "Help me add multilingual support to the computer vision detection messages"
```

## Advanced Configuration

### Model Switching
```bash
# Switch models during runtime (in TUI)
# Press Ctrl+X then M, select from list:
github-copilot/grok-code-fast-1    # Fast responses, good for quick questions
github-copilot/grok-3-mini         # Larger context, better for complex analysis
github-copilot/claude-haiku-4.5    # Good for code review and documentation
```

### Session Management
```bash
# List all sessions
opencode auth list

# Export session data
opencode export [sessionID]

# Import session data
opencode import <file>
```

### Server Mode (Advanced)
```bash
# Start headless server for remote access
opencode serve --port 3000

# Start web interface
opencode web --port 8080

# Attach to running server
opencode attach <url>
```

## Troubleshooting

### Common Issues

#### "Bad Request" Error
```bash
# If you get "Bad Request" when using models:
# 1. Check GitHub token validity
echo $GITHUB_TOKEN

# 2. Try a different model
opencode --model github-copilot/claude-haiku-4.5

# 3. Restart with fresh session
opencode --model github-copilot/grok-code-fast-1 /home/runner/workspace
```

#### TUI Interface Issues
```bash
# If TUI doesn't display properly:
# 1. Check terminal size
echo $COLUMNS $LINES

# 2. Try resizing terminal window
# 3. Use --print-logs for debugging
opencode --print-logs --log-level DEBUG
```

#### Authentication Problems
```bash
# Clear cached credentials
rm ~/.local/share/opencode/auth.json

# Check environment variables
opencode auth list

# Re-authenticate if needed
opencode auth login github-models
```

### Log Analysis
```bash
# View recent logs
tail -f ~/.local/share/opencode/log/$(ls -t ~/.local/share/opencode/log/ | head -1)

# Debug with verbose logging
opencode --print-logs --log-level DEBUG
```

## Integration with Other AI Assistants

### Multi-AI Workflow
OpenCode works alongside other AI assistants in the SIMISAI project:

1. **Claude Code** (Primary): Architecture, documentation, complex development
2. **OpenCode + Grok** (Secondary): Quick coding help, debugging, code analysis
3. **Gemini CLI** (Tertiary): Alternative AI perspective, specialized tasks

### Context Sharing
When switching between AI assistants, provide context:

```bash
# Example handoff from Claude Code to OpenCode:
opencode run --model github-copilot/grok-code-fast-1 "I'm working on the SIMISAI medical device assistance app. Claude Code helped me organize documentation in /docs/. Now I need help optimizing the WebSocket chat performance in server/routes.ts. Can you analyze the current implementation?"
```

## Best Practices

### Effective Prompting
1. **Be Specific**: Include file paths, function names, and error messages
2. **Provide Context**: Mention the SIMISAI project and relevant technologies
3. **Ask Follow-ups**: Build on previous responses for deeper analysis
4. **Include Code Snippets**: Paste relevant code for better analysis

### Performance Tips
1. **Use TUI Mode**: Faster than one-shot commands for multiple questions
2. **Choose Right Model**: Grok Code Fast 1 for speed, Grok 3 for complexity
3. **Manage Sessions**: Export important sessions for future reference
4. **Combine Tools**: Use with Claude Code for comprehensive development support

## Quick Reference Commands

```bash
# Essential OpenCode commands for SIMISAI development
opencode --model github-copilot/grok-code-fast-1 /home/runner/workspace  # Start TUI
opencode run -m github-copilot/grok-code-fast-1 "Quick question"         # One-shot
opencode --continue                                                       # Resume session
opencode models | grep grok                                              # List Grok models
opencode auth list                                                        # Check auth
opencode --help                                                          # All commands
```

---

**Last Updated**: November 2025
**OpenCode Version**: v1.0.51
**Configured Model**: github-copilot/grok-code-fast-1
**Related Documentation**: [Getting Started](getting-started.md) | [API Reference](../api/endpoints.md)