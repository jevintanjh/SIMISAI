# 🚀 SIMISAI AWS Deployment Guide

## 📋 Overview
This guide provides step-by-step instructions for deploying SIMISAI from Render to AWS with SageMaker integration and CV service connectivity.

## 🎯 System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        CF[CloudFront CDN]
        S3[S3 Static Hosting]
    end
    
    subgraph "API Layer"
        APIGW[API Gateway]
        LAMBDA[Lambda Functions]
    end
    
    subgraph "AI Services"
        SM[SageMaker Endpoint<br/>Sealion LLM]
        CVLAMBDA[CV Lambda<br/>YOLOv8 Model]
    end
    
    subgraph "Data Layer"
        RDS[RDS PostgreSQL]
        S3MODELS[S3 Model Storage]
    end
    
    subgraph "Real-time"
        WS[API Gateway WebSocket]
    end
    
    CF --> S3
    CF --> APIGW
    APIGW --> LAMBDA
    LAMBDA --> SM
    LAMBDA --> CVLAMBDA
    LAMBDA --> RDS
    LAMBDA --> S3MODELS
    WS --> LAMBDA
```

## 🔧 Prerequisites

### Required Tools
- AWS CLI v2.0+
- Node.js 18+
- Python 3.9+
- Git
- Docker (optional)

### AWS Account Setup
1. **Create AWS Account** (if not already done)
2. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your Access Key ID, Secret Access Key, Region, and Output format
   ```
3. **Create IAM User** with appropriate permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:*",
           "lambda:*",
           "apigateway:*",
           "s3:*",
           "cloudfront:*",
           "rds:*",
           "sagemaker:*",
           "iam:*",
           "ec2:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## 🚀 Deployment Steps

### Step 1: Clone and Prepare Repository
```bash
# Clone the repository
git clone https://github.com/jevintanjh/SIMISAI.git
cd SIMISAI

# Navigate to deployment directory
cd aws-deployment

# Make deployment script executable
chmod +x deploy.sh
```

### Step 2: Configure Environment Variables
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Application Configuration
ENVIRONMENT=production
DOMAIN_NAME=simisai.com
STACK_NAME=simisai-production

# SageMaker Configuration
SAGEMAKER_ENDPOINT=sealion-chat-endpoint
SAGEMAKER_REGION=us-east-1

# CV Service Configuration
CV_SERVICE_ENDPOINT=https://cv-service.example.com
CV_SERVICE_TOKEN=your-api-token

# Database Configuration
DATABASE_PASSWORD=your-secure-password
```

### Step 3: Deploy Infrastructure
```bash
# Deploy AWS infrastructure
./deploy.sh infrastructure

# This will:
# - Create VPC and networking
# - Set up RDS PostgreSQL database
# - Create Lambda functions
# - Configure API Gateway
# - Set up S3 and CloudFront
```

### Step 4: Deploy Lambda Functions
```bash
# Deploy Lambda functions
./deploy.sh lambda

# This will:
# - Package and deploy chat service
# - Package and deploy CV service
# - Update function configurations
```

### Step 5: Deploy Frontend
```bash
# Deploy frontend to S3
./deploy.sh frontend

# This will:
# - Build the Astro application
# - Upload to S3 bucket
# - Invalidate CloudFront cache
```

### Step 6: Test Deployment
```bash
# Test all endpoints
./deploy.sh test

# This will:
# - Test API Gateway endpoints
# - Test Lambda functions
# - Test CV service integration
# - Verify frontend accessibility
```

## 🔍 Verification Steps

### 1. Check CloudFormation Stack
```bash
aws cloudformation describe-stacks \
  --stack-name simisai-production \
  --region us-east-1
```

### 2. Test API Endpoints
```bash
# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name simisai-production \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayURL`].OutputValue' \
  --output text)

# Test chat endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test message","sessionId":"test-session"}' \
  $API_URL/chat

# Test CV endpoint
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"image":"test","device_type":"thermometer"}' \
  $API_URL/cv
```

### 3. Check Frontend Accessibility
```bash
# Get CloudFront URL
FRONTEND_URL=$(aws cloudformation describe-stacks \
  --stack-name simisai-production \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
  --output text)

# Test frontend
curl -I https://$FRONTEND_URL
```

## 🔧 Configuration Details

### Lambda Functions Configuration

#### Chat Service Lambda
```yaml
FunctionName: simisai-production-chat-function
Runtime: nodejs18.x
Handler: index.handler
MemorySize: 512
Timeout: 30
Environment:
  Variables:
    SAGEMAKER_ENDPOINT: sealion-chat-endpoint
    CV_SERVICE_ENDPOINT: https://cv-service.example.com
    DATABASE_URL: postgresql://user:pass@host:5432/db
```

#### CV Service Lambda
```yaml
FunctionName: simisai-production-cv-function
Runtime: python3.9
Handler: index.lambda_handler
MemorySize: 1024
Timeout: 60
Environment:
  Variables:
    CV_SERVICE_ENDPOINT: https://cv-service.example.com
    CV_SERVICE_TOKEN: your-api-token
```

### API Gateway Configuration
```yaml
RestApi:
  Name: simisai-production-api
  Description: SIMISAI REST API
  EndpointConfiguration:
    Types: [REGIONAL]
  Cors:
    AllowOrigins: ['*']
    AllowMethods: ['GET', 'POST', 'OPTIONS']
    AllowHeaders: ['Content-Type', 'Authorization']
```

### RDS Configuration
```yaml
Database:
  DBInstanceIdentifier: simisai-production-database
  DBName: simisai
  DBInstanceClass: db.t3.micro
  Engine: postgres
  EngineVersion: '15.4'
  AllocatedStorage: 20
  StorageType: gp2
  BackupRetentionPeriod: 7
  MultiAZ: false
  PubliclyAccessible: false
```

## 📊 Monitoring Setup

### CloudWatch Dashboards
```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "SIMISAI-Production" \
  --dashboard-body file://monitoring/dashboard.json
```

### Alarms Configuration
```bash
# Set up alarms for key metrics
aws cloudwatch put-metric-alarm \
  --alarm-name "SIMISAI-High-Error-Rate" \
  --alarm-description "High error rate in API Gateway" \
  --metric-name "4XXError" \
  --namespace "AWS/ApiGateway" \
  --statistic "Sum" \
  --period 300 \
  --threshold 10 \
  --comparison-operator "GreaterThanThreshold"
```

## 🔒 Security Configuration

### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": "arn:aws:sagemaker:region:account:endpoint/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds:Connect"
      ],
      "Resource": "arn:aws:rds:region:account:db:simisai-production"
    }
  ]
}
```

### VPC Security Groups
```yaml
LambdaSecurityGroup:
  GroupDescription: Security group for Lambda functions
  SecurityGroupEgress:
    - IpProtocol: -1
      CidrIp: 0.0.0.0/0

DatabaseSecurityGroup:
  GroupDescription: Security group for RDS database
  SecurityGroupIngress:
    - IpProtocol: tcp
      FromPort: 5432
      ToPort: 5432
      SourceSecurityGroupId: !Ref LambdaSecurityGroup
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Lambda Function Timeout
```bash
# Check function logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/simisai-production"

# View recent logs
aws logs tail /aws/lambda/simisai-production-chat-function --follow
```

#### 2. API Gateway 502 Errors
```bash
# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix "/aws/apigateway"

# Test Lambda function directly
aws lambda invoke \
  --function-name simisai-production-chat-function \
  --payload '{"httpMethod":"POST","path":"/chat","body":"{\"message\":\"test\"}"}' \
  response.json
```

#### 3. Database Connection Issues
```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier simisai-production-database

# Test database connectivity
aws rds describe-db-instances \
  --db-instance-identifier simisai-production-database \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 4. SageMaker Endpoint Issues
```bash
# Check SageMaker endpoint status
aws sagemaker describe-endpoint \
  --endpoint-name sealion-chat-endpoint

# Check endpoint configuration
aws sagemaker describe-endpoint-config \
  --endpoint-config-name sealion-chat-endpoint-config
```

### Performance Optimization

#### 1. Lambda Cold Start Reduction
```bash
# Enable provisioned concurrency
aws lambda put-provisioned-concurrency-config \
  --function-name simisai-production-chat-function \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig={ProvisionedConcurrencyConfig=10}
```

#### 2. CloudFront Cache Optimization
```bash
# Update cache behavior
aws cloudfront update-distribution \
  --id E1234567890 \
  --distribution-config file://cloudfront-config.json
```

#### 3. Database Connection Pooling
```typescript
// Implement connection pooling in Lambda
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 📈 Cost Optimization

### Estimated Monthly Costs
- **S3 + CloudFront**: ~$50-100
- **Lambda**: ~$20-50
- **API Gateway**: ~$30-80
- **SageMaker**: ~$200-500
- **RDS**: ~$100-200
- **Total**: ~$400-930/month

### Cost Optimization Strategies
1. **Lambda Provisioned Concurrency**: Only for critical functions
2. **CloudFront Cache**: Optimize cache policies
3. **RDS Instance**: Right-size based on usage
4. **SageMaker**: Use auto-scaling
5. **S3 Lifecycle**: Move old data to cheaper storage

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Check CloudWatch metrics and alarms
2. **Monthly**: Review costs and optimize
3. **Quarterly**: Security audit and updates
4. **Annually**: Disaster recovery testing

### Updates and Patches
```bash
# Update Lambda functions
./deploy.sh lambda

# Update infrastructure
./deploy.sh infrastructure

# Update frontend
./deploy.sh frontend
```

## 📞 Support

### Contact Information
- **Technical Lead**: [Your Name] - [email]
- **DevOps Team**: [Team Email]
- **AWS Support**: [Support Plan]

### Emergency Procedures
1. **Immediate**: Check CloudWatch alarms
2. **Short-term**: Review Lambda logs
3. **Long-term**: Contact AWS support if needed

---

## 🎯 Success Criteria

### Technical Metrics
- [ ] 99.9% uptime
- [ ] <2s API response time
- [ ] <5% error rate
- [ ] Successful CV service integration
- [ ] SageMaker response time <1s

### Business Metrics
- [ ] Zero data loss during migration
- [ ] Maintained user experience
- [ ] Cost within budget
- [ ] Security compliance
- [ ] Scalability achieved

---

*This guide will be updated as the deployment progresses. Please provide feedback and suggestions for improvement.*
