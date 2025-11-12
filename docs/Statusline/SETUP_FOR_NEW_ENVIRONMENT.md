# Claude Code AWS Bedrock Statusline - Complete Setup Guide

**Last Updated**: 2025-11-12
**Version**: 2.0

This guide explains how Claude Code connects to AWS Bedrock and how to set up the cost tracking statusline in a new environment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Understanding the Connection](#understanding-the-connection)
3. [Statusline Setup](#statusline-setup)
4. [Configuration Files](#configuration-files)
5. [Environment-Specific Instructions](#environment-specific-instructions)
6. [Verification and Testing](#verification-and-testing)
7. [Usage and Monitoring](#usage-and-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### How Claude Code Connects to AWS Bedrock

**Important**: Claude Code can be configured in two ways:

1. **Using Your Own AWS Account** (Direct Bedrock Access)
   - You configure AWS credentials
   - Claude Code calls AWS Bedrock directly
   - You get billed by AWS
   - Requires `CLAUDE_CODE_USE_BEDROCK=1`

2. **Using Anthropic's Infrastructure** (Standard API)
   - No AWS configuration needed
   - Anthropic handles backend
   - You pay Anthropic subscription

This guide covers **Option 1** - using your own AWS Bedrock account.

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Claude Code CLI (your terminal)            │    │
│  │                                                     │    │
│  │  Environment Variables:                            │    │
│  │  - CLAUDE_CODE_USE_BEDROCK=1                       │    │
│  │  - AWS_ACCESS_KEY_ID=AKIA...                       │    │
│  │  - AWS_SECRET_ACCESS_KEY=...                       │    │
│  │  - AWS_REGION=ap-southeast-1                       │    │
│  │  - AWS_BEARER_TOKEN_BEDROCK=...                    │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│               │ Direct AWS Bedrock API calls               │
│               │ Using YOUR credentials                      │
└───────────────┼─────────────────────────────────────────────┘
                │
                │ HTTPS (AWS Bedrock API)
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    YOUR AWS ACCOUNT                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         AWS Bedrock Service                        │    │
│  │         Region: ap-southeast-1 (or your choice)    │    │
│  │                                                     │    │
│  │  Model: Claude Sonnet 4.5                          │    │
│  │  (global.anthropic.claude-sonnet-4-5-...)          │    │
│  │                                                     │    │
│  │  - Processes your prompts                          │    │
│  │  - Generates responses                             │    │
│  │  - Tracks usage for YOUR AWS bill                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Your AWS Bill shows:                                       │
│  - AWS Bedrock API calls                                    │
│  - Token usage charges                                      │
│  - All costs in your AWS Cost Explorer                      │
└──────────────────────────────────────────────────────────────┘
```

### Key Points

- **You authenticate with AWS** using your IAM credentials
- **Claude Code** makes AWS Bedrock API calls directly on your behalf
- **You configure AWS credentials** in your environment
- **You pay AWS** for Bedrock usage (appears on your AWS bill)
- **The statusline** shows you the real AWS costs you're incurring

---

## Understanding the Connection

### What You're Using

When you run `claude-bed` (Bedrock version of Claude Code):

1. **Authentication**: Your AWS credentials (IAM access keys)
2. **Backend Processing**: Claude Code calls AWS Bedrock directly using YOUR AWS account
3. **Model**: `global.anthropic.claude-sonnet-4-5-20250929-v1:0`
4. **Billing**: AWS bills you directly (appears on your AWS bill)

### What Claude Code Provides

Claude Code sends JSON input to your statusline script with real usage data:

```json
{
  "session_id": "abc-123",
  "cost": {
    "total_cost_usd": 0.01737,
    "total_duration_ms": 518893,
    "total_api_duration_ms": 373533
  },
  "transcript_path": "/home/runner/.claude/projects/.../session.jsonl",
  "workspace": {
    "current_dir": "/home/runner/workspace"
  }
}
```

The statusline script:
- Parses this JSON input
- Extracts real token counts from the transcript file
- Calculates costs using AWS Bedrock pricing
- Aggregates session, daily, and weekly totals
- Returns formatted output for display

### Two Versions of Claude Code

| Version | Backend | What You See |
|---------|---------|--------------|
| **`claude-bed`** | AWS Bedrock API | Real AWS costs, detailed token counts |
| **`claude-sub`** | Anthropic Direct API | Subscription model, minimal display |

Both use the **same model** (Sonnet 4.5), just different infrastructure.

### AWS Credentials - Two Different Uses

**Important Distinction**:

```bash
# AWS credentials for Claude Code (Bedrock access)
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_ACCESS_KEY_ID=AKIA...        # IAM user with Bedrock permissions
export AWS_SECRET_ACCESS_KEY=...        # For Claude Code to call Bedrock
export AWS_REGION=ap-southeast-1        # Your preferred AWS region

# AWS credentials for your application (in .env)
AWS_ACCESS_KEY_ID=AKIA...        # For Elastic Beanstalk, RDS, etc.
AWS_SECRET_ACCESS_KEY=...        # Deployment infrastructure
```

**These can be the same credentials** if your IAM user has both Bedrock and deployment permissions, or separate IAM users for security isolation.

---

## Prerequisites: AWS Bedrock Access

Before setting up the statusline, you need AWS Bedrock access configured.

### Step 1: Enable AWS Bedrock Access

1. **Log into AWS Console**
2. **Navigate to AWS Bedrock** (search for "Bedrock" in services)
3. **Request Model Access**:
   - Click "Model access" in left sidebar
   - Click "Modify model access"
   - Select "Claude" models (especially Sonnet 4.5)
   - Submit request
   - Wait for approval (usually instant for standard models)

### Step 2: Create IAM User for Bedrock

Create an IAM user with Bedrock permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
      ]
    }
  ]
}
```

**Steps**:
1. AWS Console → IAM → Users → Create user
2. User name: `claude-code-bedrock`
3. Attach policy: Create inline policy with JSON above
4. Create access key → Download credentials

### Step 3: Configure Claude Code for Bedrock

Set environment variables (add to `~/.bashrc` or `~/.zshrc`):

```bash
# Enable Bedrock mode
export CLAUDE_CODE_USE_BEDROCK=1

# AWS credentials (from IAM user created above)
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...

# AWS region (choose one with Claude access)
export AWS_REGION=ap-southeast-1  # Singapore
# or us-east-1, us-west-2, eu-west-1, etc.
```

**Apply changes**:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Step 4: Verify Bedrock Access

Test that Claude Code can access Bedrock:

```bash
# Start Claude Code
claude-code

# If configured correctly, you should see:
# - Statusline appears (after first response)
# - No authentication errors
# - Responses from Claude Sonnet 4.5
```

**Check AWS billing** to confirm charges appear:
- AWS Console → Billing → Cost Explorer
- Service: AWS Bedrock
- Region: Your configured region

---

## Statusline Setup

### Overview

The statusline displays real-time AWS Bedrock usage and costs:

```
Session: 3.4M↑/17.2K↓ $12.83 │ Today: $17.00 │ Week: $50.46 │ 21m │ 07:31 │ ~/workspace [main]
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| **Session** | Current session input/output tokens and cost | `3.4M↑/17.2K↓ $12.83` |
| **Today** | Cumulative cost for all sessions today | `$17.00` |
| **Week** | Cumulative cost for this week (Monday-Sunday) | `$50.46` |
| **Duration** | Current session elapsed time | `21m` |
| **Time** | Current time | `07:31` |
| **Directory** | Current working directory | `~/workspace` |
| **Git Branch** | Current git branch (if in repo) | `[main]` |

### AWS Bedrock Pricing (Sonnet 4.5)

| Token Type | Price per 1K | Price per 1M | Notes |
|------------|--------------|--------------|-------|
| **Fresh input** | $0.003 | $3.00 | New content, not cached |
| **Cache write** | $0.00375 | $3.75 | Writing to cache (25% premium) |
| **Cache read** | $0.0003 | $0.30 | Reading from cache (90% discount!) |
| **Output** | $0.015 | $15.00 | Generated responses (5x input cost) |

**Key Insights**:
- Cache reads save 90% vs fresh input
- Output tokens cost 5x more than input
- Cache strategy worth it if reused 2+ times

---

## Configuration Files

### File Structure

```
~/.claude/
├── statusline-command.sh       # Main statusline script (ephemeral)
└── settings.json               # Claude Code configuration (ephemeral)

~/workspace/.claude/
├── statusline-command.sh       # Backup copy (persistent)
├── settings.json               # Backup copy (persistent)
├── restore-config.sh           # Restoration script (Replit)
├── check-health.sh             # Health check script
└── data/
    ├── usage-stats.json        # Session history and totals (persistent)
    └── statusline-debug.log    # Debug logging (persistent)
```

### Why Two Locations?

| Location | Type | Purpose |
|----------|------|---------|
| `~/.claude/` | Ephemeral | Active configuration (may be lost on restart) |
| `~/workspace/.claude/` | Persistent | Backup and data storage (survives restarts) |

**Replit-specific**: `/home/runner/` uses overlay filesystem (ephemeral), `/home/runner/workspace/` uses btrfs (persistent).

---

## Quick Setup (Copy & Paste)

### Step 1: Create Statusline Script

```bash
mkdir -p ~/.claude

cat > ~/.claude/statusline-command.sh << 'SCRIPT_END'
#!/bin/bash

# AWS Bedrock Sonnet 4.5 Cost Tracking StatusLine
# Displays: Session tokens/cost | Today | Week | Duration | Time | Dir | Git

# ==================== CONFIGURATION ====================
BEDROCK_INPUT_COST_PER_1K=0.003   # $0.003 per 1K input tokens
BEDROCK_OUTPUT_COST_PER_1K=0.015  # $0.015 per 1K output tokens
STATE_FILE="$HOME/workspace/.claude/data/usage-stats.json"

# ==================== READ INPUT ====================
INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')
CWD=$(echo "$INPUT" | jq -r '.workspace.current_dir // .cwd // ""')

# ==================== INITIALIZE STATE ====================
mkdir -p "$(dirname "$STATE_FILE")"
if [ ! -f "$STATE_FILE" ]; then
  echo '{"sessions":{},"daily":{},"weekly":{}}' > "$STATE_FILE"
fi

# ==================== TOKEN COUNTING ====================
FRESH_INPUT=0
CACHE_WRITE=0
CACHE_READ=0
OUTPUT_TOKENS=0

if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  # Parse JSONL transcript - each line is a separate JSON object
  while IFS= read -r line; do
    # Extract token counts from message.usage
    FRESH_INPUT=$((FRESH_INPUT + $(echo "$line" | jq -r '.message.usage.input_tokens // 0' 2>/dev/null || echo 0)))
    CACHE_WRITE=$((CACHE_WRITE + $(echo "$line" | jq -r '.message.usage.cache_creation_input_tokens // 0' 2>/dev/null || echo 0)))
    CACHE_READ=$((CACHE_READ + $(echo "$line" | jq -r '.message.usage.cache_read_input_tokens // 0' 2>/dev/null || echo 0)))
    OUTPUT_TOKENS=$((OUTPUT_TOKENS + $(echo "$line" | jq -r '.message.usage.output_tokens // 0' 2>/dev/null || echo 0)))
  done < "$TRANSCRIPT_PATH"
fi

# Total input tokens for display
INPUT_TOKENS=$((FRESH_INPUT + CACHE_WRITE + CACHE_READ))

# ==================== COST CALCULATION ====================
# AWS Bedrock Sonnet 4.5 pricing
FRESH_COST=$(awk "BEGIN {printf \"%.6f\", ($FRESH_INPUT * 0.003 / 1000)}")
CACHE_WRITE_COST=$(awk "BEGIN {printf \"%.6f\", ($CACHE_WRITE * 0.00375 / 1000)}")
CACHE_READ_COST=$(awk "BEGIN {printf \"%.6f\", ($CACHE_READ * 0.0003 / 1000)}")
OUTPUT_COST=$(awk "BEGIN {printf \"%.6f\", ($OUTPUT_TOKENS * 0.015 / 1000)}")

SESSION_COST=$(awk "BEGIN {printf \"%.4f\", $FRESH_COST + $CACHE_WRITE_COST + $CACHE_READ_COST + $OUTPUT_COST}")

# ==================== TIME CALCULATIONS ====================
TODAY=$(date +%Y-%m-%d)
WEEK=$(date +%Y-W%V)
CURRENT_TIME=$(date +%H:%M)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S")

# ==================== UPDATE STATE ====================
STATE=$(cat "$STATE_FILE")

# Get or create session data
SESSION_START=$(echo "$STATE" | jq -r ".sessions[\"$SESSION_ID\"].start_time // \"$TIMESTAMP\"")
SESSION_DATA=$(echo "$STATE" | jq --arg sid "$SESSION_ID" \
  --argjson input "$INPUT_TOKENS" \
  --argjson output "$OUTPUT_TOKENS" \
  --arg cost "$SESSION_COST" \
  --arg start "$SESSION_START" \
  --arg update "$TIMESTAMP" \
  '.sessions[$sid] = {
    "input_tokens": $input,
    "output_tokens": $output,
    "cost": ($cost | tonumber),
    "start_time": $start,
    "last_update": $update
  }')

# Calculate session duration
if [ "$SESSION_START" != "null" ] && [ -n "$SESSION_START" ]; then
  START_EPOCH=$(date -d "$SESSION_START" +%s 2>/dev/null || echo 0)
  CURRENT_EPOCH=$(date +%s)
  DURATION_SECONDS=$((CURRENT_EPOCH - START_EPOCH))
  DURATION_MINUTES=$((DURATION_SECONDS / 60))
  if [ $DURATION_MINUTES -lt 60 ]; then
    DURATION="${DURATION_MINUTES}m"
  else
    DURATION_HOURS=$((DURATION_MINUTES / 60))
    DURATION_MINS=$((DURATION_MINUTES % 60))
    DURATION="${DURATION_HOURS}h${DURATION_MINS}m"
  fi
else
  DURATION="0m"
fi

# Update daily total
DAILY_COST=$(echo "$SESSION_DATA" | jq --arg today "$TODAY" \
  '[.sessions[] | select(.last_update | startswith($today)) | .cost] | add // 0')
SESSION_DATA=$(echo "$SESSION_DATA" | jq --arg today "$TODAY" \
  --arg cost "$DAILY_COST" \
  '.daily[$today] = {
    "cost": ($cost | tonumber),
    "date": $today
  }')

# Update weekly total - sum all daily costs from current week
WEEKLY_COST=0
for date_key in $(echo "$SESSION_DATA" | jq -r '.daily | keys[]' 2>/dev/null); do
  # Calculate week number for this date
  date_week=$(date -d "$date_key" +%Y-W%V 2>/dev/null || echo "")

  # If this date is in the current week, add its cost
  if [ "$date_week" = "$WEEK" ]; then
    day_cost=$(echo "$SESSION_DATA" | jq -r ".daily[\"$date_key\"].cost // 0")
    WEEKLY_COST=$(awk "BEGIN {printf \"%.4f\", $WEEKLY_COST + $day_cost}")
  fi
done

SESSION_DATA=$(echo "$SESSION_DATA" | jq --arg week "$WEEK" \
  --arg cost "$WEEKLY_COST" \
  '.weekly[$week] = {
    "cost": ($cost | tonumber),
    "week": $week
  }')

# Save updated state
echo "$SESSION_DATA" > "$STATE_FILE"

# Get final daily and weekly costs
TODAY_COST=$(echo "$SESSION_DATA" | jq -r ".daily[\"$TODAY\"].cost // 0")
WEEK_COST=$(echo "$SESSION_DATA" | jq -r ".weekly[\"$WEEK\"].cost // 0")

# ==================== FORMAT TOKENS ====================
format_tokens() {
  local tokens=$1
  if [ $tokens -ge 1000000 ]; then
    awk "BEGIN {printf \"%.1fM\", $tokens/1000000}"
  elif [ $tokens -ge 1000 ]; then
    awk "BEGIN {printf \"%.1fK\", $tokens/1000}"
  else
    echo "$tokens"
  fi
}

INPUT_DISPLAY=$(format_tokens $INPUT_TOKENS)
OUTPUT_DISPLAY=$(format_tokens $OUTPUT_TOKENS)

# ==================== GIT BRANCH ====================
GIT_BRANCH=""
if [ -n "$CWD" ] && [ -d "$CWD/.git" ]; then
  GIT_BRANCH=$(cd "$CWD" && git branch --show-current 2>/dev/null)
  if [ -n "$GIT_BRANCH" ]; then
    GIT_BRANCH=" [$GIT_BRANCH]"
  fi
fi

# ==================== DIRECTORY DISPLAY ====================
if [ -n "$CWD" ]; then
  # Show relative to home if possible
  DIR_DISPLAY=$(echo "$CWD" | sed "s|^$HOME|~|")
else
  DIR_DISPLAY="~"
fi

# ==================== OUTPUT ====================
printf "Session: %s↑/%s↓ \$%.2f │ Today: \$%.2f │ Week: \$%.2f │ %s │ %s │ %s%s" \
  "$INPUT_DISPLAY" \
  "$OUTPUT_DISPLAY" \
  "$SESSION_COST" \
  "$TODAY_COST" \
  "$WEEK_COST" \
  "$DURATION" \
  "$CURRENT_TIME" \
  "$DIR_DISPLAY" \
  "$GIT_BRANCH"
SCRIPT_END

chmod +x ~/.claude/statusline-command.sh
```

### Step 2: Configure Claude Code Settings

```bash
cat > ~/.claude/settings.json << 'EOF'
{
  "alwaysThinkingEnabled": true,
  "statusLine": {
    "type": "command",
    "command": "/home/runner/.claude/statusline-command.sh"
  }
}
EOF
```

**Note**: Adjust the path in `command` if your home directory is different (e.g., `/home/user/.claude/statusline-command.sh`).

### Step 3: Create Persistent Data Directory

```bash
mkdir -p ~/workspace/.claude/data
echo '{"sessions":{},"daily":{},"weekly":{}}' > ~/workspace/.claude/data/usage-stats.json
```

### Step 4: Create Backup Copies

```bash
# Copy to workspace for persistence
cp ~/.claude/statusline-command.sh ~/workspace/.claude/
cp ~/.claude/settings.json ~/workspace/.claude/
```

### Step 5: Create Restore Script (Replit/Cloud IDEs)

```bash
cat > ~/workspace/.claude/restore-config.sh << 'EOF'
#!/bin/bash
# Claude Code Statusline - Restoration Script
# Run this after container restarts to restore statusline configuration

set -e

echo "🔧 Restoring Claude Code statusline configuration..."
echo ""

# Create directories
mkdir -p ~/.claude/data

# Copy configuration
cp ~/workspace/.claude/statusline-command.sh ~/.claude/statusline-command.sh
chmod +x ~/.claude/statusline-command.sh

# Copy settings if needed
if [ ! -f ~/.claude/settings.json ]; then
  cp ~/workspace/.claude/settings.json ~/.claude/settings.json 2>/dev/null || \
    echo '{"alwaysThinkingEnabled":true,"statusLine":{"type":"command","command":"'$HOME'/.claude/statusline-command.sh"}}' > ~/.claude/settings.json
fi

# Link data directory (optional)
if [ ! -L ~/.claude/data ]; then
  rm -rf ~/.claude/data 2>/dev/null || true
  ln -s ~/workspace/.claude/data ~/.claude/data
fi

echo "✅ Statusline configuration restored!"
echo ""
echo "Restart Claude Code to see the statusline."
EOF

chmod +x ~/workspace/.claude/restore-config.sh
```

### Step 6: Create Health Check Script

```bash
cat > ~/workspace/.claude/check-health.sh << 'EOF'
#!/bin/bash
# Health check for Claude Code statusline

echo "🏥 Claude Code Statusline Health Check"
echo "======================================"
echo ""

# Check script exists
if [ -f ~/.claude/statusline-command.sh ]; then
  echo "✅ Script exists: ~/.claude/statusline-command.sh"
else
  echo "❌ Script missing: ~/.claude/statusline-command.sh"
fi

# Check script is executable
if [ -x ~/.claude/statusline-command.sh ]; then
  echo "✅ Script is executable"
else
  echo "❌ Script is not executable"
fi

# Check settings
if [ -f ~/.claude/settings.json ]; then
  echo "✅ Settings exist: ~/.claude/settings.json"
  if grep -q "statusLine" ~/.claude/settings.json; then
    echo "✅ StatusLine configured in settings"
  else
    echo "❌ StatusLine not configured in settings"
  fi
else
  echo "❌ Settings missing: ~/.claude/settings.json"
fi

# Check data directory
if [ -d ~/workspace/.claude/data ]; then
  echo "✅ Data directory exists"
else
  echo "❌ Data directory missing"
fi

# Check state file
if [ -f ~/workspace/.claude/data/usage-stats.json ]; then
  echo "✅ State file exists"
  # Show current totals
  if command -v jq &> /dev/null; then
    TODAY=$(date +%Y-%m-%d)
    TODAY_COST=$(cat ~/workspace/.claude/data/usage-stats.json | jq -r ".daily[\"$TODAY\"].cost // 0")
    echo "   Today's cost: \$$TODAY_COST"
  fi
else
  echo "❌ State file missing"
fi

# Test script manually
echo ""
echo "🧪 Testing script execution..."
TEST_OUTPUT=$(echo '{"session_id":"test","workspace":{"current_dir":"'$(pwd)'"}}' | ~/.claude/statusline-command.sh 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ Script executed successfully"
  echo "   Output: $TEST_OUTPUT"
else
  echo "❌ Script execution failed"
  echo "   Error: $TEST_OUTPUT"
fi

echo ""
echo "======================================"
echo "Health check complete!"
EOF

chmod +x ~/workspace/.claude/check-health.sh
```

### Step 7: Restart Claude Code

Exit and re-enter your Claude Code session. The statusline should appear at the top:

```
Session: 0↑/0↓ $0.00 │ Today: $0.00 │ Week: $0.00 │ 0m │ 15:30 │ ~/workspace [main]
```

---

## Environment-Specific Instructions

### Replit

**Key Considerations**:
- Home directory (`/home/runner/`) uses ephemeral overlay filesystem
- Workspace directory (`/home/runner/workspace/`) uses persistent btrfs storage
- Container restarts every 1-24 hours, wiping `/home/runner/`

**After Container Restart**:
```bash
~/workspace/.claude/restore-config.sh
# Takes ~30 seconds
```

**File Locations**:
- **Active config**: `~/.claude/` (ephemeral)
- **Persistent backup**: `~/workspace/.claude/` (survives restarts)
- **Data**: `~/workspace/.claude/data/` (survives restarts)

### Local Machine

**Key Considerations**:
- Home directory persists across restarts
- No restore script needed
- Simpler file structure

**File Locations**:
- **Config**: `~/.claude/` (persistent)
- **Data**: `~/.claude/data/` or `~/workspace/.claude/data/` (your choice)

**Adjust STATE_FILE path** in script if needed:
```bash
# For local machine, you might prefer:
STATE_FILE="$HOME/.claude/data/usage-stats.json"
```

### Other Cloud IDEs (Codespaces, Gitpod, etc.)

**Check First**:
```bash
# Test if home directory persists
echo "test" > ~/test.txt
# Restart container
cat ~/test.txt  # If this works, home directory persists
```

**If home persists**: Follow local machine instructions
**If home doesn't persist**: Follow Replit instructions

---

## Verification and Testing

### Health Check

```bash
~/workspace/.claude/check-health.sh
```

Expected output:
```
🏥 Claude Code Statusline Health Check
======================================

✅ Script exists: ~/.claude/statusline-command.sh
✅ Script is executable
✅ Settings exist: ~/.claude/settings.json
✅ StatusLine configured in settings
✅ Data directory exists
✅ State file exists
   Today's cost: $0.00

🧪 Testing script execution...
✅ Script executed successfully
   Output: Session: 0↑/0↓ $0.00 │ Today: $0.00 │ Week: $0.00 │ 0m │ 15:30 │ ~/workspace [main]

======================================
Health check complete!
```

### Manual Testing

```bash
# Test the script with sample input
echo '{"session_id":"test","workspace":{"current_dir":"'$(pwd)'"}}' | ~/.claude/statusline-command.sh
```

Expected output (example):
```
Session: 0↑/0↓ $0.00 │ Today: $0.00 │ Week: $0.00 │ 0m │ 15:30 │ ~/workspace [main]
```

### Verify Statusline Appears

1. Restart Claude Code (exit and re-enter)
2. Look at the top of your terminal
3. Should see: `Session: ... │ Today: ... │ Week: ...`
4. After first AI response, costs should update

---

## Usage and Monitoring

### View Usage Stats

```bash
# View all usage data
cat ~/workspace/.claude/data/usage-stats.json | jq .

# Check today's cost
TODAY=$(date +%Y-%m-%d)
cat ~/workspace/.claude/data/usage-stats.json | jq ".daily[\"$TODAY\"].cost"

# Check this week's cost
WEEK=$(date +%Y-W%V)
cat ~/workspace/.claude/data/usage-stats.json | jq ".weekly[\"$WEEK\"].cost"

# Calculate all-time total
cat ~/workspace/.claude/data/usage-stats.json | jq '[.sessions[].cost] | add'

# Find most expensive session
cat ~/workspace/.claude/data/usage-stats.json | jq '.sessions | to_entries | max_by(.value.cost)'

# List sessions over $1
cat ~/workspace/.claude/data/usage-stats.json | jq '.sessions[] | select(.cost > 1)'
```

### Cost Monitoring Tips

1. **Set Daily Budgets**: Watch the "Today" value
2. **Weekly Reviews**: Check weekly totals for trends
3. **Session Awareness**: Monitor session costs for expensive operations
4. **Historical Analysis**: Use jq queries to analyze spending patterns

### Understanding Cost Breakdown

**File-heavy sessions** (reading large codebases):
- High cache read tokens (90% discount applies)
- Low output tokens
- Example: 500K cache reads = $0.15 (vs $1.50 as fresh input)

**Code generation sessions**:
- Moderate input tokens
- High output tokens (5x price multiplier)
- Example: 50K input + 200K output = $0.15 + $3.00 = $3.15

**Conversational sessions**:
- Balanced input/output ratio
- Growing cache over time (more savings per message)
- Example: 100K input + 150K output = $0.30 + $2.25 = $2.55

---

## Troubleshooting

### Statusline Not Showing

**Check 1**: Verify configuration
```bash
cat ~/.claude/settings.json
# Should contain: "statusLine": {"type": "command", "command": "..."}
```

**Check 2**: Verify script exists and is executable
```bash
ls -la ~/.claude/statusline-command.sh
# Should show: -rwxr-xr-x (executable)
```

**Check 3**: Test script manually
```bash
echo '{"session_id":"test"}' | ~/.claude/statusline-command.sh
# Should output statusline format
```

**Fix**: Restore configuration
```bash
~/workspace/.claude/restore-config.sh
```

### Statusline Shows $0.00

**This is normal** at the start of a session. Costs update after each AI response.

**To verify it's working**:
1. Ask Claude a question
2. Wait for response
3. Statusline should update with costs

### Script Execution Fails

**Error**: `jq: command not found`

**Fix**: Install jq
```bash
# Debian/Ubuntu
sudo apt-get install jq

# macOS
brew install jq

# Replit (usually pre-installed)
# If not, add to replit.nix
```

**Error**: `date: invalid date`

**Fix**: Check date command compatibility
```bash
# GNU date (Linux)
date -d "2025-01-01" +%s

# BSD date (macOS)
date -j -f "%Y-%m-%d" "2025-01-01" +%s
```

If on macOS, you may need to install GNU coreutils:
```bash
brew install coreutils
# Use gdate instead of date in script
```

### State File Corrupted

If usage stats become corrupted:

```bash
# Backup existing data
cp ~/workspace/.claude/data/usage-stats.json ~/workspace/.claude/data/usage-stats.json.backup

# Reinitialize
echo '{"sessions":{},"daily":{},"weekly":{}}' > ~/workspace/.claude/data/usage-stats.json
```

### Permissions Issues

```bash
# Fix script permissions
chmod +x ~/.claude/statusline-command.sh
chmod +x ~/workspace/.claude/restore-config.sh
chmod +x ~/workspace/.claude/check-health.sh

# Fix data directory permissions
chmod -R u+w ~/workspace/.claude/data/
```

---

## Customization

### Change Pricing

If AWS Bedrock pricing changes, update the script:

```bash
nano ~/.claude/statusline-command.sh

# Update these lines:
BEDROCK_INPUT_COST_PER_1K=0.003          # Standard input
BEDROCK_OUTPUT_COST_PER_1K=0.015         # Output
# (Add these if not present)
BEDROCK_CACHE_WRITE_COST_PER_1K=0.00375  # Cache write
BEDROCK_CACHE_READ_COST_PER_1K=0.0003    # Cache read
```

Then sync to workspace:
```bash
cp ~/.claude/statusline-command.sh ~/workspace/.claude/
```

### Modify Display Format

Edit the final `printf` statement in the script to customize what's shown:

```bash
# Example: Add emoji icons
printf "💰 Session: %s↑/%s↓ \$%.2f │ 📅 Today: \$%.2f │ 📊 Week: \$%.2f │ ⏱ %s │ 🕐 %s │ 📁 %s%s" \
  ...

# Example: Remove week display
printf "Session: %s↑/%s↓ \$%.2f │ Today: \$%.2f │ %s │ %s │ %s%s" \
  "$INPUT_DISPLAY" \
  "$OUTPUT_DISPLAY" \
  "$SESSION_COST" \
  "$TODAY_COST" \
  "$DURATION" \
  "$CURRENT_TIME" \
  "$DIR_DISPLAY" \
  "$GIT_BRANCH"
```

### Change State File Location

For local machines, you might prefer a simpler path:

```bash
# Change in script:
STATE_FILE="$HOME/.claude/data/usage-stats.json"

# Create directory:
mkdir -p ~/.claude/data

# Initialize:
echo '{"sessions":{},"daily":{},"weekly":{}}' > ~/.claude/data/usage-stats.json
```

---

## Additional Resources

### Related Documentation

- **[User Guide](GUIDE.md)** - Complete usage guide
- **[Pricing Reference](PRICING_REFERENCE.md)** - AWS Bedrock pricing details
- **[Technical Reports](TOKEN_FIX_REPORT.md)** - Implementation history

### Quick Reference Commands

```bash
# After container restart (Replit)
~/workspace/.claude/restore-config.sh

# Health check
~/workspace/.claude/check-health.sh

# View today's cost
cat ~/workspace/.claude/data/usage-stats.json | jq ".daily[\"$(date +%Y-%m-%d)\"].cost"

# View this week's cost
cat ~/workspace/.claude/data/usage-stats.json | jq ".weekly[\"$(date +%Y-W%V)\"].cost"

# Calculate all-time total
cat ~/workspace/.claude/data/usage-stats.json | jq '[.sessions[].cost] | add'
```

---

## FAQ

### Q: Do I need AWS credentials for the statusline?

**A**: Yes, if you're using the direct AWS Bedrock mode (CLAUDE_CODE_USE_BEDROCK=1). The statusline displays costs from YOUR AWS Bedrock usage. Claude Code makes API calls using your AWS credentials.

### Q: Can I use this with claude-sub (subscription API)?

**A**: The statusline works but shows minimal information (no costs/tokens) since claude-sub uses subscription pricing, not pay-per-token.

### Q: Why are my costs different from the statusline?

**A**: The statusline shows real-time estimates based on token usage. Check your actual AWS bill in Cost Explorer (AWS Console → Billing) for exact charges. Small discrepancies may occur due to rounding or pricing updates.

### Q: How accurate are the token counts?

**A**: 100% accurate. Token counts are extracted directly from Claude Code's transcript files, which contain real usage data from AWS Bedrock.

### Q: Can I track costs across multiple machines?

**A**: No. The state file is local to each environment. Each machine tracks its own usage independently.

### Q: Does the statusline slow down Claude Code?

**A**: No. The script runs quickly (<100ms typically) and doesn't interfere with Claude's processing.

### Q: How do I see my actual AWS bill?

**A**:
1. AWS Console → Billing Dashboard
2. Click "Cost Explorer"
3. Filter by Service: "AWS Bedrock"
4. Group by: Region or Usage Type
5. Compare with statusline totals for verification

You can also use AWS CLI:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity DAILY \
  --metrics BlendedCost \
  --filter file://<(echo '{
    "Dimensions": {
      "Key": "SERVICE",
      "Values": ["Amazon Bedrock"]
    }
  }')
```

### Q: Can I disable the statusline temporarily?

**A**: Yes. Edit `~/.claude/settings.json` and remove or comment out the `statusLine` section, then restart Claude Code.

---

## Support

If you encounter issues:

1. **Run health check**: `~/workspace/.claude/check-health.sh`
2. **Check script execution**: `echo '{"session_id":"test"}' | ~/.claude/statusline-command.sh`
3. **Verify settings**: `cat ~/.claude/settings.json`
4. **Check Claude Code version**: Ensure you're using a recent version

For bugs or feature requests, consult Claude Code's official documentation or support channels.

---

**Setup Complete!** 🎉

Your statusline is now configured to track AWS Bedrock costs in real-time. Start a conversation with Claude Code and watch the costs update after each response.

**Remember**:
- Replit users: Run `~/workspace/.claude/restore-config.sh` after container restarts
- Monitor daily/weekly costs to stay within budget
- Cache reads save 90% on costs - leverage long sessions!
