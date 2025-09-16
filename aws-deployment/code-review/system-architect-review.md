# 🔍 System Architect Code Review Process

## 🎯 Mission Statement
The System Architect subagent will conduct comprehensive code reviews before any commit and deployment to ensure AWS compatibility, security, performance, and integration readiness.

## 📋 Pre-Commit Review Checklist

### 1. **AWS Compatibility Review**
- [ ] **Lambda Function Compatibility**
  - Node.js/Python runtime compatibility
  - Memory and timeout requirements
  - Environment variable usage
  - AWS SDK integration

- [ ] **API Gateway Integration**
  - REST API endpoint structure
  - WebSocket API configuration
  - CORS headers and policies
  - Request/response format validation

- [ ] **Database Integration**
  - RDS PostgreSQL connection strings
  - Drizzle ORM compatibility
  - Connection pooling implementation
  - Migration script validation

### 2. **Security Review**
- [ ] **Authentication & Authorization**
  - IAM role permissions
  - API key management
  - Token validation
  - CORS configuration

- [ ] **Data Protection**
  - Sensitive data encryption
  - Environment variable security
  - Database credential protection
  - API endpoint security

- [ ] **Network Security**
  - VPC configuration
  - Security group rules
  - NAT Gateway setup
  - Private subnet usage

### 3. **Performance Review**
- [ ] **Lambda Optimization**
  - Cold start mitigation
  - Memory allocation
  - Timeout configuration
  - Provisioned concurrency

- [ ] **Database Performance**
  - Query optimization
  - Connection pooling
  - Index usage
  - Query caching

- [ ] **API Performance**
  - Response time optimization
  - Caching strategies
  - Rate limiting
  - Error handling

### 4. **Integration Review**
- [ ] **SageMaker Integration**
  - Endpoint configuration
  - Request format validation
  - Response handling
  - Error fallback mechanisms

- [ ] **CV Service Integration**
  - API contract compliance
  - Error handling
  - Retry logic
  - Fallback detection

- [ ] **Frontend Integration**
  - API endpoint updates
  - Error handling
  - Loading states
  - Mobile responsiveness

## 🔧 Code Review Tools & Scripts

### Pre-Commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 System Architect Code Review Starting..."

# Run system architect review
./aws-deployment/code-review/system-architect-review.sh

if [ $? -eq 0 ]; then
    echo "✅ System Architect Review Passed"
    exit 0
else
    echo "❌ System Architect Review Failed"
    exit 1
fi
```

### Automated Review Script
```bash
#!/bin/bash
# aws-deployment/code-review/system-architect-review.sh

echo "🏗️ System Architect Code Review"
echo "================================"

# Check AWS compatibility
check_aws_compatibility() {
    echo "🔍 Checking AWS compatibility..."
    
    # Check Lambda functions
    if [ -d "aws-deployment/lambda" ]; then
        echo "  ✅ Lambda functions directory found"
        
        # Check chat service
        if [ -f "aws-deployment/lambda/chat-service/index.js" ]; then
            echo "  ✅ Chat service Lambda function found"
            
            # Check for AWS SDK usage
            if grep -q "@aws-sdk" "aws-deployment/lambda/chat-service/package.json"; then
                echo "  ✅ AWS SDK dependencies found"
            else
                echo "  ❌ AWS SDK dependencies missing"
                return 1
            fi
        else
            echo "  ❌ Chat service Lambda function missing"
            return 1
        fi
        
        # Check CV service
        if [ -f "aws-deployment/lambda/cv-service/index.py" ]; then
            echo "  ✅ CV service Lambda function found"
        else
            echo "  ❌ CV service Lambda function missing"
            return 1
        fi
    else
        echo "  ❌ Lambda functions directory missing"
        return 1
    fi
    
    # Check CloudFormation template
    if [ -f "aws-deployment/infrastructure/cloudformation-template.yaml" ]; then
        echo "  ✅ CloudFormation template found"
    else
        echo "  ❌ CloudFormation template missing"
        return 1
    fi
    
    echo "  ✅ AWS compatibility check passed"
    return 0
}

# Check security configuration
check_security() {
    echo "🔒 Checking security configuration..."
    
    # Check for hardcoded secrets
    if grep -r "password\|secret\|key" aws-deployment/ | grep -v "\.env\|\.gitignore\|README\|\.md"; then
        echo "  ❌ Potential hardcoded secrets found"
        return 1
    fi
    
    # Check IAM policies
    if grep -q "Effect.*Allow" aws-deployment/infrastructure/cloudformation-template.yaml; then
        echo "  ✅ IAM policies configured"
    else
        echo "  ❌ IAM policies missing"
        return 1
    fi
    
    # Check security groups
    if grep -q "SecurityGroup" aws-deployment/infrastructure/cloudformation-template.yaml; then
        echo "  ✅ Security groups configured"
    else
        echo "  ❌ Security groups missing"
        return 1
    fi
    
    echo "  ✅ Security check passed"
    return 0
}

# Check performance optimization
check_performance() {
    echo "⚡ Checking performance optimization..."
    
    # Check Lambda memory configuration
    if grep -q "MemorySize" aws-deployment/infrastructure/cloudformation-template.yaml; then
        echo "  ✅ Lambda memory configuration found"
    else
        echo "  ❌ Lambda memory configuration missing"
        return 1
    fi
    
    # Check timeout configuration
    if grep -q "Timeout" aws-deployment/infrastructure/cloudformation-template.yaml; then
        echo "  ✅ Lambda timeout configuration found"
    else
        echo "  ❌ Lambda timeout configuration missing"
        return 1
    fi
    
    # Check CloudFront configuration
    if grep -q "CloudFront" aws-deployment/infrastructure/cloudformation-template.yaml; then
        echo "  ✅ CloudFront configuration found"
    else
        echo "  ❌ CloudFront configuration missing"
        return 1
    fi
    
    echo "  ✅ Performance check passed"
    return 0
}

# Check integration readiness
check_integration() {
    echo "🔗 Checking integration readiness..."
    
    # Check SageMaker integration
    if grep -q "SAGEMAKER_ENDPOINT" aws-deployment/lambda/chat-service/index.js; then
        echo "  ✅ SageMaker integration found"
    else
        echo "  ❌ SageMaker integration missing"
        return 1
    fi
    
    # Check CV service integration
    if grep -q "CV_SERVICE_ENDPOINT" aws-deployment/lambda/cv-service/index.py; then
        echo "  ✅ CV service integration found"
    else
        echo "  ❌ CV service integration missing"
        return 1
    fi
    
    # Check database integration
    if grep -q "DATABASE_URL" aws-deployment/lambda/chat-service/index.js; then
        echo "  ✅ Database integration found"
    else
        echo "  ❌ Database integration missing"
        return 1
    fi
    
    echo "  ✅ Integration check passed"
    return 0
}

# Run all checks
main() {
    local exit_code=0
    
    check_aws_compatibility || exit_code=1
    check_security || exit_code=1
    check_performance || exit_code=1
    check_integration || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "🎉 System Architect Review Passed!"
        echo "✅ Code is ready for AWS deployment"
    else
        echo ""
        echo "❌ System Architect Review Failed!"
        echo "🔧 Please fix the issues above before deployment"
    fi
    
    return $exit_code
}

main
```

## 📊 Review Metrics & Standards

### Code Quality Metrics
- **Test Coverage**: Minimum 80%
- **Security Score**: A+ rating
- **Performance Score**: <2s response time
- **AWS Compatibility**: 100% compatible

### Review Standards
- **AWS Best Practices**: Followed
- **Security Guidelines**: Compliant
- **Performance Standards**: Met
- **Integration Requirements**: Satisfied

## 🚨 Review Failure Handling

### Common Issues & Solutions

#### 1. **AWS Compatibility Issues**
```bash
# Issue: Missing AWS SDK
# Solution: Add to package.json
npm install @aws-sdk/client-sagemaker-runtime

# Issue: Incorrect Lambda runtime
# Solution: Update CloudFormation template
Runtime: nodejs18.x
```

#### 2. **Security Issues**
```bash
# Issue: Hardcoded secrets
# Solution: Use environment variables
const password = process.env.DATABASE_PASSWORD;

# Issue: Missing IAM policies
# Solution: Add to CloudFormation template
Policies:
  - PolicyName: SageMakerAccess
    PolicyDocument: {...}
```

#### 3. **Performance Issues**
```bash
# Issue: High Lambda timeout
# Solution: Optimize code and increase memory
MemorySize: 1024
Timeout: 60

# Issue: Missing caching
# Solution: Add CloudFront caching
DefaultCacheBehavior:
  Compress: true
  ForwardedValues:
    QueryString: false
```

#### 4. **Integration Issues**
```bash
# Issue: Missing environment variables
# Solution: Add to Lambda configuration
Environment:
  Variables:
    SAGEMAKER_ENDPOINT: sealion-chat-endpoint
    CV_SERVICE_ENDPOINT: https://cv-service.example.com
```

## 🔄 Continuous Review Process

### 1. **Pre-Commit Review**
- Automated script execution
- Quick compatibility check
- Security scan
- Performance validation

### 2. **Pre-Deployment Review**
- Comprehensive architecture review
- Integration testing
- Security audit
- Performance benchmarking

### 3. **Post-Deployment Review**
- Monitoring setup validation
- Performance metrics review
- Security compliance check
- Cost optimization analysis

## 📋 Review Checklist Template

```markdown
## System Architect Code Review

### AWS Compatibility ✅
- [ ] Lambda functions compatible
- [ ] API Gateway integration ready
- [ ] Database connection configured
- [ ] CloudFormation template valid

### Security ✅
- [ ] No hardcoded secrets
- [ ] IAM policies configured
- [ ] Security groups set up
- [ ] CORS properly configured

### Performance ✅
- [ ] Lambda memory optimized
- [ ] Timeout configured
- [ ] Caching implemented
- [ ] Database queries optimized

### Integration ✅
- [ ] SageMaker integration ready
- [ ] CV service integration ready
- [ ] Database integration ready
- [ ] Frontend integration ready

### Overall Assessment
- **Status**: ✅ APPROVED / ❌ NEEDS WORK
- **Risk Level**: LOW / MEDIUM / HIGH
- **Deployment Ready**: YES / NO
- **Recommendations**: [List any recommendations]
```

## 🎯 Review Activation Commands

### Manual Review
```bash
# Run system architect review
./aws-deployment/code-review/system-architect-review.sh

# Review specific component
system-architect review lambda-functions
system-architect review security-config
system-architect review integration-setup
```

### Automated Review
```bash
# Pre-commit hook
git commit -m "Your commit message"

# Pre-deployment review
./aws-deployment/deploy.sh review

# Continuous review
./aws-deployment/code-review/continuous-review.sh
```

## 📞 Review Escalation

### Review Levels
1. **Level 1**: Automated script review
2. **Level 2**: Manual architecture review
3. **Level 3**: Senior architect consultation
4. **Level 4**: CTO review

### Escalation Triggers
- Security vulnerabilities
- Performance degradation
- Integration failures
- Cost overruns

---

## 🎯 Next Steps

1. **Set up pre-commit hooks** for automated review
2. **Configure review scripts** for continuous monitoring
3. **Train team** on review process
4. **Implement review metrics** tracking
5. **Schedule regular review sessions**

The System Architect subagent is now ready to conduct comprehensive code reviews before any commit and deployment! 🚀
