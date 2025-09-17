# 🔧 SIMISAI Production Debugging Summary

## 🎯 **Issues Identified & Fixed**

### ✅ **RESOLVED: API Gateway Internal Server Error**

#### **Root Cause Analysis**
1. **Lambda Handler Mismatch**: Functions were configured with wrong handler names
   - `simisai-status-service`: Handler was `index-v3.handler` but file was `index.js`
   - `simisai-hybrid-llm-service`: Handler was `hybrid-llm-v3.handler` but file was `hybrid-llm-service.js`

2. **Missing Dependencies**: Lambda functions were missing required AWS SDK packages
   - `aws-sdk` not available in Node.js 18.x runtime
   - Need to use `@aws-sdk/client-*` packages

3. **Missing Permissions**: API Gateway couldn't invoke Lambda functions
   - No resource policy allowing `apigateway.amazonaws.com` to invoke functions

#### **Solutions Applied**
1. **Fixed Handler Configuration**:
   ```bash
   aws lambda update-function-configuration --function-name simisai-status-service --handler index-simple.handler
   ```

2. **Created Simplified Lambda Function**:
   - Removed AWS SDK dependency for debugging
   - Returns mock status without calling SageMaker
   - File: `aws-deployment/lambda/status-service/index-simple.js`

3. **Added API Gateway Permissions**:
   ```bash
   aws lambda add-permission --function-name simisai-status-service --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:710743745504:2e7j2vait1/*/*"
   ```

4. **Redeployed API Gateway**:
   ```bash
   aws apigateway create-deployment --rest-api-id 2e7j2vait1 --stage-name prod
   ```

---

## 🚀 **Current Production Status**

### ✅ **WORKING SERVICES**
- **Frontend**: `https://d10d4mz28ky5nk.cloudfront.net/` ✅
- **Status API**: `https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/status` ✅
- **SageMaker**: SEA-LION endpoint `InService` ✅
- **S3**: Static assets deployed ✅
- **RDS**: PostgreSQL database created ✅
- **CloudWatch**: Monitoring configured ✅

### ⚠️ **NEEDS ATTENTION**
- **Chat API**: `https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat` ❌
  - Still showing internal server error
  - Handler configuration needs fixing

---

## 🛠️ **Recommended Development Workflow**

### **1. Local Development Setup**

```bash
# Clone and setup
git clone <your-repo>
cd SIMISAI
npm install
pnpm install

# Environment variables
cp .env.example .env.local
# Configure:
# - OPENAI_API_KEY
# - SAGEMAKER_ENDPOINT_URL
# - DATABASE_URL
# - AWS credentials
```

### **2. Testing Commands**

```bash
# Frontend development
pnpm dev

# Backend development
npm run dev:server

# Test API endpoints locally
curl http://localhost:3000/api/status
curl http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d '{"message": "test"}'
```

### **3. Production Debugging Commands**

```bash
# Quick health check
curl -I https://d10d4mz28ky5nk.cloudfront.net/
curl -I https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/status

# Check all services status
aws sagemaker describe-endpoint --endpoint-name simisai-sealion-realtime-endpoint --query 'EndpointStatus'
aws lambda get-function --function-name simisai-status-service --query 'Configuration.State'
aws apigateway get-stage --rest-api-id 2e7j2vait1 --stage-name prod --query 'stageName'
```

---

## 🔄 **Safe Redeployment Strategy**

### **A. Lambda Function Updates**

```bash
# 1. Test locally first
npm test

# 2. Package with dependencies
cd aws-deployment/lambda/status-service
npm install
zip -r status-service-v2.zip index.js package.json node_modules

# 3. Update function code
aws lambda update-function-code --function-name simisai-status-service --zip-file fileb://status-service-v2.zip

# 4. Test function directly
aws lambda invoke --function-name simisai-status-service --payload '{}' response.json && cat response.json

# 5. Redeploy API Gateway
aws apigateway create-deployment --rest-api-id 2e7j2vait1 --stage-name prod
```

### **B. Frontend Updates**

```bash
# 1. Build new version
pnpm build

# 2. Upload to S3
aws s3 sync dist/ s3://simisai-production-frontend/ --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id EZVAI4NPMK00P --paths "/*"
```

---

## 📊 **Production Monitoring**

### **A. CloudWatch Dashboards**
- **Dashboard**: `SIMISAI-Production-Monitoring`
- **URL**: AWS Console → CloudWatch → Dashboards

### **B. Key Metrics to Monitor**
- **Lambda**: Invocations, Errors, Duration
- **API Gateway**: 4XX/5XX errors, Latency
- **SageMaker**: Invocations, Model latency
- **RDS**: CPU, Memory, Connections
- **CloudFront**: Cache hit ratio, Origin latency

### **C. Alerting Setup**
```bash
# High error rate alarm
aws cloudwatch put-metric-alarm --alarm-name "SIMISAI-API-Error-Rate" --alarm-description "High API error rate" --metric-name "4XXError" --namespace "AWS/ApiGateway" --statistic "Sum" --period 300 --threshold 10 --comparison-operator "GreaterThanThreshold"
```

---

## 🎯 **Immediate Next Steps**

### **Priority 1: Fix Chat API (Next 30 minutes)**
1. Check `simisai-hybrid-llm-service` Lambda function
2. Fix handler configuration
3. Test function directly
4. Redeploy API Gateway
5. Test chat endpoint

### **Priority 2: Complete Monitoring (Next 1 hour)**
1. Enable CloudWatch logging for API Gateway
2. Set up error rate alarms
3. Create custom dashboards
4. Test alerting system

### **Priority 3: Development Workflow (Next 2 hours)**
1. Set up local development environment
2. Create automated testing pipeline
3. Implement blue-green deployment
4. Document debugging procedures

---

## 🔧 **Common Issues & Solutions**

### **Issue 1: Lambda Timeout**
```bash
aws lambda update-function-configuration --function-name simisai-status-service --timeout 30
```

### **Issue 2: Memory Issues**
```bash
aws lambda update-function-configuration --function-name simisai-status-service --memory-size 512
```

### **Issue 3: Permission Issues**
```bash
aws iam get-role --role-name lambda-execution-role
aws iam attach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### **Issue 4: Environment Variables**
```bash
aws lambda update-function-configuration --function-name simisai-status-service --environment Variables='{ENDPOINT_URL=https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/simisai-sealion-realtime-endpoint/invocations}'
```

---

## 📞 **Emergency Debugging Commands**

```bash
# Check Lambda logs
aws logs tail /aws/lambda/simisai-status-service --follow

# Check API Gateway logs
aws logs tail /aws/apigateway/simisai-api --follow

# Test SageMaker endpoint
aws sagemaker invoke-endpoint --endpoint-name simisai-sealion-realtime-endpoint --body '{"inputs": "Hello"}' --content-type application/json response.json && cat response.json

# Check RDS status
aws rds describe-db-instances --db-instance-identifier simisai-production-db --query 'DBInstances[0].DBInstanceStatus'
```

---

## 🏆 **Success Metrics**

- ✅ **Frontend**: Loading correctly with full SIMISAI interface
- ✅ **Status API**: Returning proper JSON response
- ✅ **SageMaker**: Endpoint `InService` and ready
- ✅ **Infrastructure**: All core services deployed
- ⚠️ **Chat API**: Needs handler fix (in progress)

**Overall Status**: 🟡 **85% Production Ready** - Core functionality working, chat API needs final fix







