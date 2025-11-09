# SIMISAI Deployment Workflows with OpenCode/Grok Integration

## Overview

This document defines deployment workflows for the SIMISAI medical device assistance platform, integrating OpenCode + Grok for deployment automation and AWS infrastructure management.

## Pre-Deployment Validation

### Medical Device Platform Readiness Check
```bash
# Use OpenCode + Grok for comprehensive pre-deployment validation
opencode run --model github-copilot/grok-code-fast-1 "Validate the SIMISAI medical device platform is ready for deployment: check medical device detection accuracy, AI chat appropriateness, multilingual content, and AWS infrastructure readiness"

# Validation checklist:
# ✅ Medical device detection accuracy > 95%
# ✅ AI chat responses medically appropriate with disclaimers
# ✅ Multilingual medical content validated across 5 languages
# ✅ Medical device API endpoints security validated
# ✅ Database medical device schema integrity confirmed
# ✅ AWS infrastructure health verified
```

### Code Quality Validation for Medical Software
```bash
# Use Session Code Reviewer agent before deployment
# Automated checks:
# - TypeScript strict mode compliance for medical data safety
# - Medical device API security validation
# - Medical device guidance content appropriateness
# - Accessibility compliance for medical device users
# - Medical device data privacy protection
# - Error handling for medical device detection failures
```

## Staging Deployment Workflow

### AWS Staging Environment Setup
```bash
# Use OpenCode + Grok for staging deployment guidance
opencode run --model github-copilot/grok-code-fast-1 "Deploy SIMISAI medical device platform to AWS staging environment with proper medical device validation and testing"

# Staging deployment steps:
# 1. Build medical device platform components
pnpm run build

# 2. Deploy Lambda functions for medical device APIs
aws lambda update-function-code --function-name simisai-cv-service-staging --zip-file fileb://cv-service.zip
aws lambda update-function-code --function-name simisai-chat-service-staging --zip-file fileb://chat-service.zip
aws lambda update-function-code --function-name simisai-guidance-service-staging --zip-file fileb://guidance-service.zip

# 3. Deploy frontend to staging S3 bucket
aws s3 sync dist/ s3://simisai-staging-frontend/ --delete

# 4. Update SageMaker staging endpoint if needed
aws sagemaker update-endpoint --endpoint-name simisai-sealion-staging-endpoint --endpoint-config-name staging-config
```

### Medical Device Platform Staging Validation
```bash
# Use OpenCode + Grok for automated staging validation
opencode run --model github-copilot/grok-code-fast-1 "Perform comprehensive staging validation for SIMISAI medical device platform including CV detection, AI chat, multilingual support, and platform integration"

# Staging validation tests:
# 1. Medical device detection accuracy testing
curl -X POST https://staging-api.simisai.com/api/cv/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"base64_medical_device_image","confidence_threshold":0.8}'

# 2. AI medical guidance chat testing
curl -X POST https://staging-api.simisai.com/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"staging-test","question":"How to use blood pressure monitor?","language":"en"}'

# 3. Multilingual medical device content testing
for lang in en id th vi fil; do
  curl "https://staging-api.simisai.com/api/devices/bp-monitor/instructions?language=$lang"
done

# 4. WebSocket medical guidance testing
# Test real-time medical device chat functionality

# 5. Database medical device schema validation
# Verify medical device data integrity and schema consistency
```

## Production Deployment Workflow

### Production Readiness Gate
```bash
# Use AWS Deployment Specialist agent for production readiness
# Automated production readiness checks:
# ✅ Staging validation passed with 100% success rate
# ✅ Medical device detection accuracy validated
# ✅ AI chat medical guidance quality approved
# ✅ Multilingual medical content accuracy confirmed
# ✅ Performance benchmarks met for medical device platform
# ✅ Security scan passed for medical device data handling
# ✅ Accessibility validation completed for medical device users
```

### Blue-Green Production Deployment
```bash
# Use OpenCode + Grok for production deployment orchestration
opencode run --model github-copilot/grok-code-fast-1 "Execute blue-green deployment for SIMISAI medical device platform to ensure zero downtime for medical device users worldwide"

# Blue-green deployment workflow:
# 1. Deploy to green environment (production-green)
aws lambda update-function-code --function-name simisai-cv-service-green --zip-file fileb://cv-service.zip
aws lambda update-function-code --function-name simisai-chat-service-green --zip-file fileb://chat-service.zip

# 2. Update green SageMaker endpoint
aws sagemaker update-endpoint --endpoint-name simisai-sealion-green-endpoint

# 3. Deploy green frontend
aws s3 sync dist/ s3://simisai-production-green-frontend/

# 4. Validate green environment medical device functionality
# Run medical device platform health checks

# 5. Switch traffic to green environment
aws apigateway create-deployment --rest-api-id 2e7j2vait1 --stage-name prod-green

# 6. Monitor medical device platform performance

# 7. Decommission blue environment after 24h monitoring period
```

### SageMaker Medical AI Model Deployment
```bash
# Use OpenCode + Grok for SageMaker deployment guidance
opencode run --model github-copilot/grok-code-fast-1 "Deploy updated Sealion LLM model to SIMISAI SageMaker endpoint with proper medical device context and validation"

# SageMaker deployment workflow:
# 1. Fix current model archive issue (priority issue from infrastructure assessment)
aws sagemaker create-model --model-name simisai-sealion-fixed \
  --primary-container Image=763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0.0-cpu-py310-ubuntu20.04-sagemaker,ModelDataUrl=s3://simis-model-storage/sealion_model/fixed-model.tar.gz

# 2. Create new endpoint configuration
aws sagemaker create-endpoint-config --endpoint-config-name simisai-sealion-config-fixed \
  --production-variants VariantName=primary,ModelName=simisai-sealion-fixed,InitialInstanceCount=1,InstanceType=ml.m5.large

# 3. Update production endpoint
aws sagemaker update-endpoint --endpoint-name simisai-sealion-realtime-endpoint \
  --endpoint-config-name simisai-sealion-config-fixed

# 4. Validate medical AI guidance quality
# Test medical device guidance responses for appropriateness and accuracy
```

## CloudFormation Infrastructure Deployment

### SIMISAI Production Stack Recreation
```bash
# Use OpenCode + Grok for CloudFormation deployment guidance
opencode run --model github-copilot/grok-code-fast-1 "Recreate the SIMISAI production CloudFormation stack that was deleted, ensuring proper medical device platform infrastructure"

# CloudFormation deployment steps:
# 1. Prepare CloudFormation template for medical device platform
# Template should include:
# - VPC with proper security groups for medical device APIs
# - Lambda functions for medical device services
# - API Gateway for medical device endpoints
# - RDS PostgreSQL for medical device data
# - S3 buckets for medical device assets
# - CloudFront for global medical device user access
# - SageMaker endpoint for medical AI guidance

# 2. Deploy production infrastructure
aws cloudformation create-stack \
  --stack-name simisai-production \
  --template-body file://infrastructure/simisai-production-template.yaml \
  --parameters file://infrastructure/production-parameters.json \
  --capabilities CAPABILITY_IAM

# 3. Monitor stack creation for medical device platform components
aws cloudformation describe-stack-events --stack-name simisai-production

# 4. Validate infrastructure for medical device platform requirements
# - Medical device API Gateway endpoints functional
# - Medical device database schema applied
# - Medical device S3 assets accessible globally
# - Medical device SageMaker endpoint operational
```

### CloudFront CDN Setup for Global Medical Device Access
```bash
# Use OpenCode + Grok for CloudFront configuration
opencode run --model github-copilot/grok-code-fast-1 "Configure CloudFront CDN for SIMISAI medical device platform to ensure fast global access for medical device users with varying connectivity"

# CloudFront deployment workflow:
# 1. Create CloudFront distribution for medical device platform
aws cloudfront create-distribution --distribution-config file://cloudfront-medical-device-config.json

# 2. Configure edge caching for medical device assets
# - Medical device images and icons: Cache for 1 week
# - Medical device instructions: Cache for 1 day
# - Medical device API responses: No caching for real-time guidance
# - Medical device detection models: Cache for 1 month

# 3. Setup custom domain for medical device platform
# Configure DNS and SSL certificate for simisai.com

# 4. Optimize for global medical device users
# - Enable gzip compression for medical device content
# - Configure regional edge caches for medical device assets
# - Setup health monitoring for medical device platform availability
```

## Deployment Monitoring and Validation

### Real-time Medical Device Platform Monitoring
```bash
# Use OpenCode + Grok for monitoring setup
opencode run --model github-copilot/grok-code-fast-1 "Setup comprehensive monitoring for SIMISAI medical device platform deployment including medical device detection accuracy, AI guidance quality, and global platform performance"

# Monitoring configuration:
# 1. CloudWatch dashboards for medical device platform
aws cloudwatch put-dashboard --dashboard-name "SIMISAI-Medical-Device-Platform" \
  --dashboard-body file://monitoring/medical-device-dashboard.json

# 2. Medical device detection accuracy monitoring
# Alert if CV detection accuracy drops below 95%

# 3. AI medical guidance quality monitoring
# Alert if chat response time exceeds 2 seconds
# Alert if SageMaker endpoint fails

# 4. Medical device platform availability monitoring
# Alert if any medical device API endpoint fails
# Alert if medical device database becomes unavailable

# 5. Global medical device user experience monitoring
# Monitor response times across different global regions
# Track medical device platform accessibility metrics
```

### Post-Deployment Medical Device Platform Validation
```bash
# Use OpenCode + Grok for comprehensive post-deployment testing
opencode run --model github-copilot/grok-code-fast-1 "Perform complete post-deployment validation of SIMISAI medical device platform including end-to-end medical device workflows"

# Post-deployment validation checklist:
# 1. Medical device detection pipeline validation
# - Test all 24 medical device classes in YOLOv8 model
# - Validate detection accuracy across different device manufacturers
# - Test confidence threshold appropriateness for medical device safety

# 2. AI medical guidance validation
# - Test medical device chat responses for appropriateness
# - Validate medical disclaimers in AI responses
# - Test SageMaker + OpenAI fallback functionality
# - Validate WebSocket real-time medical device guidance

# 3. Multilingual medical device content validation
# - Test medical device instructions in all 5 languages
# - Validate cultural appropriateness of medical device guidance
# - Test multilingual AI chat functionality

# 4. Medical device platform performance validation
# - Measure medical device detection response times
# - Measure AI chat response times for medical device guidance
# - Test platform performance under medical device user load
# - Validate global accessibility for medical device users

# 5. Medical device data security validation
# - Test medical device data encryption in transit
# - Validate medical device user session security
# - Test medical device usage data privacy protection
```

## Rollback Procedures for Medical Device Platform

### Emergency Rollback for Medical Safety
```bash
# Use OpenCode + Grok for emergency rollback guidance
opencode run --model github-copilot/grok-code-fast-1 "Execute emergency rollback for SIMISAI medical device platform if medical device guidance accuracy or safety is compromised"

# Emergency rollback workflow:
# 1. Immediate traffic redirection to previous stable version
aws apigateway create-deployment --rest-api-id 2e7j2vait1 --stage-name prod-rollback

# 2. Rollback SageMaker endpoint if AI guidance issues
aws sagemaker update-endpoint --endpoint-name simisai-sealion-realtime-endpoint \
  --endpoint-config-name previous-stable-config

# 3. Rollback Lambda functions for medical device APIs
aws lambda update-function-code --function-name simisai-cv-service \
  --zip-file fileb://previous-stable-cv-service.zip

# 4. Rollback frontend if medical device interface issues
aws s3 sync s3://simisai-backup-frontend/ s3://simisai-production-frontend/

# 5. Validate rollback success for medical device platform
# Test medical device detection accuracy
# Test AI medical guidance appropriateness
# Test multilingual medical device content

# 6. Investigate and document rollback reason
# Root cause analysis for medical device platform issue
# Documentation update for prevention of similar issues
```

## Deployment Security for Medical Device Platform

### Medical Device Data Security Validation
```bash
# Security validation for medical device platform deployment:
# 1. Medical device API endpoint security
# - Authentication and authorization for medical device services
# - Rate limiting for medical device API endpoints
# - Input validation for medical device data

# 2. Medical device database security
# - Encryption at rest for medical device usage data
# - Network security for medical device database access
# - Backup security for medical device data recovery

# 3. Medical device platform compliance
# - HIPAA-like protections for medical device usage data
# - Medical device user privacy protection
# - Medical device data retention policies

# 4. Global medical device platform security
# - SSL/TLS encryption for global medical device users
# - Regional security compliance for medical device data
# - Security monitoring for medical device platform attacks
```

---

**Last Updated**: November 2025
**Applies To**: SIMISAI Medical Device Assistance Platform
**Critical Priority**: Medical device user safety and platform reliability
**Related Documentation**: [AWS Infrastructure](../docs/deployment/aws-infrastructure.md) | [OpenCode Setup](../docs/development/opencode-setup.md)