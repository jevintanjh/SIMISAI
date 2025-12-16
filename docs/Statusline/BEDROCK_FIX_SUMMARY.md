# AWS Bedrock Claude Sonnet 4.5 Fix Summary

**Date**: 2025-11-12
**Issue**: `claude-bed` alias not working with AWS Bedrock Sonnet 4.5

## Root Cause

Two issues were preventing AWS Bedrock access:

### 1. IAM Policy Restrictions
The `BedrockClaudeAccess` policy had:
- List operations (`ListFoundationModels`, `GetFoundationModel`) restricted to specific model ARNs
- **Problem**: These operations require `"Resource": "*"` in AWS
- Missing permissions for **inference profiles** (required for Sonnet 4.5)

### 2. Model Access Method
Claude Sonnet 4.5 requires using **inference profiles** instead of direct model invocation:
- ❌ Old (doesn't work): `anthropic.claude-sonnet-4-5-20250929-v1:0`
- ✅ New (works): `us.anthropic.claude-sonnet-4-5-20250929-v1:0` (inference profile)

## What Was Fixed

### Updated IAM Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-*",
        "arn:aws:bedrock:*:*:inference-profile/*anthropic*"
      ]
    }
  ]
}
```

**Key Changes**:
1. List operations now have `"Resource": "*"`
2. Added inference profile ARN pattern: `arn:aws:bedrock:*:*:inference-profile/*anthropic*`

### Available Claude Sonnet 4.5 Inference Profiles

| Profile Type | Inference Profile ID | Regions |
|-------------|---------------------|---------|
| **US Regional** | `us.anthropic.claude-sonnet-4-5-20250929-v1:0` | us-east-1, us-east-2, us-west-2 |
| **Global** | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` | All supported AWS regions |

## Verification Test

Successfully invoked Claude Sonnet 4.5:
```bash
aws bedrock-runtime invoke-model \
  --model-id us.anthropic.claude-sonnet-4-5-20250929-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":10,"messages":[{"role":"user","content":"Say hello"}]}' \
  /tmp/response.json

# Response:
# {"model":"claude-sonnet-4-5-20250929","content":[{"type":"text","text":"Hello! How can I help you today?"}],...}
```

## Usage

Your `claude-bed` alias should now work correctly:

```bash
# Use AWS Bedrock mode with Claude Sonnet 4.5
claude-bed

# Verify you're in the right mode
env | grep CLAUDE_CODE_USE_BEDROCK
# Should show: CLAUDE_CODE_USE_BEDROCK=1
```

### Current Alias Configuration
From `.config/bashrc`:
```bash
alias claude-bed='CLAUDE_CODE_USE_BEDROCK=1 \
  AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID \
  AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY \
  AWS_REGION=us-east-1 \
  claude-code'
```

## What Claude Code Will Use

When you run `claude-bed`, Claude Code will:
1. Detect `CLAUDE_CODE_USE_BEDROCK=1`
2. Use AWS credentials from environment
3. Automatically use the appropriate inference profile for Claude Sonnet 4.5
4. Display real-time cost tracking in the statusline

## Cost Information

AWS Bedrock pricing for Claude Sonnet 4.5:
- Fresh input: $3.00 per 1M tokens
- Cache write: $3.75 per 1M tokens (25% premium)
- Cache read: $0.30 per 1M tokens (90% discount!)
- Output: $15.00 per 1M tokens

Your statusline will track these costs in real-time.

## Troubleshooting

If `claude-bed` still doesn't work:

1. **Verify IAM policy**:
   ```bash
   aws iam get-user-policy --user-name simisaiadmin --policy-name BedrockClaudeAccess
   ```

2. **Test model access**:
   ```bash
   aws bedrock list-foundation-models --by-provider anthropic | grep sonnet-4-5
   ```

3. **Test invocation**:
   ```bash
   aws bedrock-runtime invoke-model \
     --model-id us.anthropic.claude-sonnet-4-5-20250929-v1:0 \
     --body fileb://test-body.json \
     /tmp/test-response.json
   ```

4. **Check Claude Code version**:
   ```bash
   npm list -g @anthropic-ai/claude-code
   # Should show: @anthropic-ai/claude-code@2.0.37 or later
   ```

## Related Documentation

- [AWS Bedrock Setup Guide](SETUP_FOR_NEW_ENVIRONMENT.md)
- [Statusline User Guide](GUIDE.md)
- [AWS Pricing Reference](PRICING_REFERENCE.md)

---

**Status**: ✅ Fixed and verified working
**Next Steps**: Run `claude-bed` to use AWS Bedrock with Claude Sonnet 4.5
