# AWS Infrastructure Status

## 📊 Current Deployment Status

### ✅ Deployed & Operational Resources

#### **S3 Storage**
- **simisai-production-frontend**
  - Status: ✅ Active
  - Purpose: Primary production frontend hosting
  - URL: Static assets and application files

- **simisai-frontend-1758031227**
  - Status: ✅ Active with static website hosting
  - Purpose: Live demo frontend
  - URL: http://simisai-frontend-1758031227.s3-website-us-east-1.amazonaws.com/
  - Configuration: Public read access with proper bucket policy

- **simisaisealionv4**
  - Status: ✅ Active
  - Purpose: Model storage and assets

#### **SageMaker AI Platform**
- **Endpoint**: `simisai-sealion-realtime-endpoint`
  - Status: ✅ InService
  - Model: Sealion 27B LLM
  - Instance: Real-time inference endpoint
  - ⚠️ **Issue**: Model archive extraction failure
  - Config: `simisai-sealion-realtime-config-v6`

#### **RDS Database**
- **Instance**: `simisai-production-db`
  - Status: ✅ Available
  - Engine: PostgreSQL
  - Purpose: Primary application database

#### **Lambda Functions** (19 Deployed)
- `simisai-hybrid-llm-service` - Main LLM service
- `simisai-chat-service` - Chat functionality
- `simisai-cv-service` - Computer vision processing
- `simisai-backend-service` - Core backend logic
- `simisai-database-setup` - Database initialization
- `simisai-guidance-service` - Step-by-step instructions
- `simisai-status-service` - Health monitoring
- `simisai-cache-service` - Caching layer
- Additional specialized functions for multilingual content generation

#### **API Gateway**
- **API**: `simisai-api`
  - ID: 2e7j2vait1
  - Status: ✅ Active
  - Purpose: RESTful API endpoints

### ⚠️ Infrastructure Issues

#### **CloudFormation Stacks**
- **Status**: All `simisai-production` stacks show `DELETE_COMPLETE`
- **Impact**: Core infrastructure templates may need redeployment
- **Action Required**: Recreate production stack from templates

#### **CloudFront CDN**
- **Status**: ❌ No distributions found
- **Impact**: No CDN for frontend optimization
- **Action Required**: Create CloudFront distribution for S3 bucket

#### **SageMaker Model Issue**
- **Problem**: Model archive extraction failure
- **File**: `s3://simis-model-storage/sealion_model/sealion-v1.1.mar`
- **Impact**: Sealion LLM may not be fully functional
- **Action Required**: Rebuild and redeploy model archive

## 🏗️ Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   API Gateway   │    │   Lambda        │
│   (Missing)     │◄──►│   simisai-api   │◄──►│   Functions     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3 Buckets    │    │   RDS Database  │    │   SageMaker     │
│   (3 Active)    │    │   PostgreSQL    │    │   Endpoint      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 AWS Resource Inventory

### Compute Resources
| Service | Resource | Status | Purpose |
|---------|----------|--------|---------|
| Lambda | 19 Functions | ✅ Deployed | Backend services |
| SageMaker | 1 Endpoint | ⚠️ Model issue | AI inference |

### Storage Resources
| Service | Resource | Status | Purpose |
|---------|----------|--------|---------|
| S3 | simisai-production-frontend | ✅ Active | Production hosting |
| S3 | simisai-frontend-1758031227 | ✅ Live | Demo frontend |
| S3 | simisaisealionv4 | ✅ Active | Model storage |
| RDS | simisai-production-db | ✅ Available | Database |

### Networking Resources
| Service | Resource | Status | Purpose |
|---------|----------|--------|---------|
| API Gateway | simisai-api | ✅ Active | REST endpoints |
| CloudFront | None | ❌ Missing | CDN distribution |
| VPC | Default | ✅ Available | Network isolation |

## 🚀 Deployment Procedures

### Frontend Deployment
```bash
# Build production frontend
pnpm run build

# Deploy to S3
aws s3 sync dist/ s3://simisai-production-frontend/

# Invalidate CloudFront (when created)
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

### Lambda Function Deployment
```bash
# Deploy hybrid LLM service
cd aws-deployment/lambda/chat-service/
./deploy-hybrid.ps1

# Deploy status service
cd aws-deployment/lambda/status-service/
./deploy-status.ps1
```

### SageMaker Model Update
```bash
# Fix model archive issue
cd aws-deployment/
./fix-model-archive.ps1

# Deploy new model version
./setup-sagemaker-complete.ps1
```

## 🔍 Infrastructure Monitoring

### Health Check Endpoints
- **API Status**: `/api/status` via API Gateway
- **Database Health**: Lambda function monitoring
- **SageMaker Endpoint**: Inference availability
- **S3 Website**: HTTP response monitoring

### CloudWatch Metrics
- Lambda function invocations and errors
- API Gateway request counts and latency
- RDS database performance metrics
- S3 bucket request statistics

### Logs and Debugging
- **Lambda Logs**: CloudWatch Log Groups
- **API Gateway Logs**: Request/response tracing
- **SageMaker Logs**: Inference endpoint logs
- **Frontend Logs**: Browser console (client-side)

## 🔧 Troubleshooting Guide

### Common Issues

#### Frontend Not Loading
1. Check S3 bucket public read permissions
2. Verify static website hosting configuration
3. Confirm index.html exists in bucket root

#### API Calls Failing
1. Verify API Gateway endpoint URL
2. Check Lambda function logs in CloudWatch
3. Confirm CORS configuration
4. Test individual Lambda functions

#### Database Connection Issues
1. Check RDS instance status
2. Verify security group rules
3. Test database connectivity from Lambda
4. Review connection string configuration

#### SageMaker Inference Errors
1. Check endpoint status: InService vs Failed
2. Review model archive integrity
3. Monitor inference request logs
4. Verify IAM permissions for invocation

### Recovery Procedures

#### CloudFormation Stack Recovery
```bash
# Redeploy production infrastructure
aws cloudformation create-stack \
  --stack-name simisai-production \
  --template-body file://production-template.yaml \
  --parameters file://parameters.json
```

#### SageMaker Model Recovery
```bash
# Create new model archive
./aws-deployment/create-proper-model-archive.ps1

# Update endpoint with new model
aws sagemaker update-endpoint --endpoint-name simisai-sealion-realtime-endpoint
```

## 📈 Performance Metrics

### Current Capacity
- **Lambda Concurrent Executions**: 1000 (regional limit)
- **API Gateway Rate Limit**: 10,000 requests/second
- **SageMaker Endpoint**: Real-time inference
- **RDS Database**: General Purpose (GP2) storage

### Cost Optimization
- **Lambda**: Pay-per-invocation pricing
- **S3**: Standard storage class for active assets
- **RDS**: Right-sized instance for current load
- **SageMaker**: On-demand inference pricing

## 🔐 Security Configuration

### Access Control
- **IAM Roles**: Least privilege principle
- **S3 Bucket Policies**: Public read for website content
- **API Gateway**: CORS enabled for frontend domain
- **RDS Security Groups**: Lambda function access only

### Data Protection
- **Encryption at Rest**: RDS and S3 encryption enabled
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Session Security**: Secure session management in PostgreSQL

---

**Last Updated**: November 2025
**Infrastructure Owner**: SIMISAI Development Team
**Emergency Contact**: Reference [Troubleshooting Guide](troubleshooting.md)