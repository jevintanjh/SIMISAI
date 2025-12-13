# AWS Infrastructure Status

> **🔧 Developer Tools:** For Claude Code AWS Bedrock configuration, see [BEDROCK-VERIFICATION-REPORT.md](./BEDROCK-VERIFICATION-REPORT.md)

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

## 🔐 Pending Security Enhancements

### Database Security Improvements (Priority: HIGH)

**Status**: ⚠️ Documented for implementation
**Last Updated**: November 14, 2025
**Context**: Security hardening recommendations from database architecture review

#### 1. Credential Management & Rotation
**Current Issue**: Database password stored in plaintext in repository files
**Security Risk**: HIGH - Credentials exposed in version control history

**Action Items**:
- [ ] Rotate RDS master password immediately
- [ ] Store new password in AWS Secrets Manager (create secret: `simisai/database/master`)
- [ ] Enable automatic rotation policy (30-90 day cycle)
- [ ] Update all Lambda functions to retrieve DATABASE_URL from Secrets Manager
- [ ] Remove plaintext passwords from repository files:
  - `aws-deployment/parameters.json`
  - `docs/archived/session-handoffs/DEPLOYMENT-STATUS.md`
  - CloudFormation templates
- [ ] Add `.env` files to `.gitignore` (if not present)

**Estimated Time**: 3-4 hours
**Resources**: [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/)

#### 2. Lambda Environment Configuration
**Current Issue**: Backend Lambda functions missing DATABASE_URL environment variable
**Impact**: Services cannot connect to RDS database

**Action Items**:
- [ ] Configure DATABASE_URL for all 19 Lambda functions:
  - `simisai-backend-service`
  - `simisai-guidance-service`
  - `simisai-database-setup`
  - `simisai-chat-service`
  - `simisai-cache-service`
  - All multilingual content generation functions
- [ ] Use Secrets Manager ARN reference (not plaintext)
- [ ] Grant Lambda execution roles permission to read secrets
- [ ] Test database connectivity from each Lambda function
- [ ] Document connection string format in deployment procedures

**Estimated Time**: 2-3 hours
**Dependencies**: Complete credential rotation first

#### 3. Connection Security & Encryption
**Current Gap**: SSL/TLS enforcement not verified

**Action Items**:
- [ ] Enable RDS SSL/TLS enforcement (require encrypted connections)
- [ ] Update PostgreSQL parameter group: `rds.force_ssl = 1`
- [ ] Download RDS CA certificate bundle
- [ ] Configure Lambda functions with SSL certificate path
- [ ] Test connection with `sslmode=require` parameter
- [ ] Document SSL configuration in connection strings

**Estimated Time**: 2 hours
**Resources**: [RDS PostgreSQL SSL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html)

#### 4. IAM Database Authentication (Optional Enhancement)
**Benefit**: Eliminate passwords entirely, use IAM tokens for authentication

**Action Items**:
- [ ] Enable IAM database authentication on RDS instance
- [ ] Create IAM database users in PostgreSQL
- [ ] Grant Lambda execution roles `rds-db:connect` permission
- [ ] Update connection logic to use IAM token generation
- [ ] Test IAM authentication from Lambda functions
- [ ] Migrate from password-based to IAM-based authentication

**Estimated Time**: 4-5 hours
**Priority**: Medium (implement after basic credential rotation)

#### 5. Access Control & Monitoring
**Enhancement**: Implement database access auditing

**Action Items**:
- [ ] Enable RDS Enhanced Monitoring
- [ ] Configure CloudWatch alarms for suspicious database activity
- [ ] Review and minimize database user permissions (least privilege)
- [ ] Implement row-level security (RLS) for multi-tenant data isolation
- [ ] Create read-only database roles for reporting queries
- [ ] Enable PostgreSQL query logging (log_statement = 'all' for audit period)
- [ ] Document role hierarchy and permission matrix

**Estimated Time**: 4-6 hours
**Priority**: Medium (implement incrementally)

---

**Total Estimated Implementation Time**: 15-20 hours
**Recommended Approach**: Implement in phases (credential rotation → Lambda config → encryption → IAM auth → monitoring)
**Target Timeline**: Q1 2025 before medical device certification

**Cross-References**:
- Database Schema: [/docs/architecture/database-schema.md](/docs/architecture/database-schema.md)
- Backend Architecture: [/docs/architecture/backend-architecture.md](/docs/architecture/backend-architecture.md)
- AWS Deployment Guide: [Getting Started](/docs/development/getting-started.md)

---

**Last Updated**: November 2025
**Infrastructure Owner**: SIMISAI Development Team
**Emergency Contact**: Reference [Troubleshooting Guide](troubleshooting.md)