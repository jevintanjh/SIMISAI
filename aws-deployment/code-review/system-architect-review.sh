#!/bin/bash

# System Architect Code Review Script
# Comprehensive review before commit and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Review counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
    ((FAILED_CHECKS++))
}

log_header() {
    echo -e "${PURPLE}[🔍 REVIEW]${NC} $1"
}

# Increment total checks
increment_check() {
    ((TOTAL_CHECKS++))
}

# Check AWS compatibility
check_aws_compatibility() {
    log_header "AWS Compatibility Review"
    echo "=================================="
    
    # Check Lambda functions directory
    increment_check
    if [ -d "aws-deployment/lambda" ]; then
        log_success "Lambda functions directory found"
    else
        log_error "Lambda functions directory missing"
        return 1
    fi
    
    # Check chat service Lambda
    increment_check
    if [ -f "aws-deployment/lambda/chat-service/index.js" ]; then
        log_success "Chat service Lambda function found"
        
        # Check for AWS SDK usage
        increment_check
        if grep -q "@aws-sdk" "aws-deployment/lambda/chat-service/package.json" 2>/dev/null; then
            log_success "AWS SDK dependencies found in chat service"
        else
            log_error "AWS SDK dependencies missing in chat service"
        fi
        
        # Check for SageMaker integration
        increment_check
        if grep -q "SageMakerRuntimeClient" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
            log_success "SageMaker integration found in chat service"
        else
            log_error "SageMaker integration missing in chat service"
        fi
    else
        log_error "Chat service Lambda function missing"
    fi
    
    # Check CV service Lambda
    increment_check
    if [ -f "aws-deployment/lambda/cv-service/index.py" ]; then
        log_success "CV service Lambda function found"
        
        # Check for CV service integration
        increment_check
        if grep -q "CV_SERVICE_ENDPOINT" "aws-deployment/lambda/cv-service/index.py" 2>/dev/null; then
            log_success "CV service integration found"
        else
            log_error "CV service integration missing"
        fi
    else
        log_error "CV service Lambda function missing"
    fi
    
    # Check CloudFormation template
    increment_check
    if [ -f "aws-deployment/infrastructure/cloudformation-template.yaml" ]; then
        log_success "CloudFormation template found"
        
        # Check for required resources
        increment_check
        if grep -q "AWS::Lambda::Function" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
            log_success "Lambda functions defined in CloudFormation"
        else
            log_error "Lambda functions missing in CloudFormation"
        fi
        
        increment_check
        if grep -q "AWS::ApiGateway::RestApi" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
            log_success "API Gateway defined in CloudFormation"
        else
            log_error "API Gateway missing in CloudFormation"
        fi
        
        increment_check
        if grep -q "AWS::RDS::DBInstance" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
            log_success "RDS database defined in CloudFormation"
        else
            log_error "RDS database missing in CloudFormation"
        fi
    else
        log_error "CloudFormation template missing"
    fi
    
    # Check deployment script
    increment_check
    if [ -f "aws-deployment/deploy.sh" ]; then
        log_success "Deployment script found"
    else
        log_error "Deployment script missing"
    fi
    
    echo ""
}

# Check security configuration
check_security() {
    log_header "Security Configuration Review"
    echo "=================================="
    
    # Check for hardcoded secrets
    increment_check
    if grep -r "password\|secret\|key" aws-deployment/ 2>/dev/null | grep -v "\.env\|\.gitignore\|README\|\.md\|process\.env\|os\.environ" > /dev/null; then
        log_error "Potential hardcoded secrets found"
        echo "  Found in:"
        grep -r "password\|secret\|key" aws-deployment/ 2>/dev/null | grep -v "\.env\|\.gitignore\|README\|\.md\|process\.env\|os\.environ" | head -5
    else
        log_success "No hardcoded secrets found"
    fi
    
    # Check IAM policies
    increment_check
    if grep -q "Effect.*Allow" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "IAM policies configured"
    else
        log_error "IAM policies missing"
    fi
    
    # Check security groups
    increment_check
    if grep -q "SecurityGroup" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "Security groups configured"
    else
        log_error "Security groups missing"
    fi
    
    # Check VPC configuration
    increment_check
    if grep -q "AWS::EC2::VPC" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "VPC configuration found"
    else
        log_error "VPC configuration missing"
    fi
    
    # Check CORS configuration
    increment_check
    if grep -q "Access-Control-Allow-Origin" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "CORS headers configured in chat service"
    else
        log_warning "CORS headers not found in chat service"
    fi
    
    echo ""
}

# Check performance optimization
check_performance() {
    log_header "Performance Optimization Review"
    echo "===================================="
    
    # Check Lambda memory configuration
    increment_check
    if grep -q "MemorySize" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "Lambda memory configuration found"
    else
        log_error "Lambda memory configuration missing"
    fi
    
    # Check timeout configuration
    increment_check
    if grep -q "Timeout" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "Lambda timeout configuration found"
    else
        log_error "Lambda timeout configuration missing"
    fi
    
    # Check CloudFront configuration
    increment_check
    if grep -q "CloudFront" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "CloudFront configuration found"
    else
        log_error "CloudFront configuration missing"
    fi
    
    # Check database connection pooling
    increment_check
    if grep -q "Pool\|pool" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Database connection pooling found"
    else
        log_warning "Database connection pooling not found"
    fi
    
    # Check error handling
    increment_check
    if grep -q "try\|catch\|error" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Error handling implemented in chat service"
    else
        log_warning "Error handling not found in chat service"
    fi
    
    echo ""
}

# Check integration readiness
check_integration() {
    log_header "Integration Readiness Review"
    echo "================================"
    
    # Check SageMaker integration
    increment_check
    if grep -q "SAGEMAKER_ENDPOINT" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "SageMaker integration found"
    else
        log_error "SageMaker integration missing"
    fi
    
    # Check CV service integration
    increment_check
    if grep -q "CV_SERVICE_ENDPOINT" "aws-deployment/lambda/cv-service/index.py" 2>/dev/null; then
        log_success "CV service integration found"
    else
        log_error "CV service integration missing"
    fi
    
    # Check database integration
    increment_check
    if grep -q "DATABASE_URL" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Database integration found"
    else
        log_error "Database integration missing"
    fi
    
    # Check environment variables
    increment_check
    if grep -q "Environment:" "aws-deployment/infrastructure/cloudformation-template.yaml" 2>/dev/null; then
        log_success "Environment variables configured"
    else
        log_error "Environment variables missing"
    fi
    
    # Check fallback mechanisms
    increment_check
    if grep -q "fallback\|Fallback" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Fallback mechanisms implemented"
    else
        log_warning "Fallback mechanisms not found"
    fi
    
    echo ""
}

# Check code quality
check_code_quality() {
    log_header "Code Quality Review"
    echo "======================="
    
    # Check for proper error handling
    increment_check
    if grep -q "console\.error\|logger\.error" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Error logging implemented"
    else
        log_warning "Error logging not found"
    fi
    
    # Check for proper logging
    increment_check
    if grep -q "console\.log\|logger\.info" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Info logging implemented"
    else
        log_warning "Info logging not found"
    fi
    
    # Check for input validation
    increment_check
    if grep -q "if.*message\|if.*body" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Input validation implemented"
    else
        log_warning "Input validation not found"
    fi
    
    # Check for proper HTTP status codes
    increment_check
    if grep -q "statusCode.*200\|statusCode.*400\|statusCode.*500" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "HTTP status codes implemented"
    else
        log_warning "HTTP status codes not found"
    fi
    
    echo ""
}

# Check documentation
check_documentation() {
    log_header "Documentation Review"
    echo "======================"
    
    # Check for README files
    increment_check
    if [ -f "aws-deployment/README.md" ] || [ -f "aws-deployment/DEPLOYMENT-GUIDE.md" ]; then
        log_success "Documentation found"
    else
        log_warning "Documentation missing"
    fi
    
    # Check for API documentation
    increment_check
    if grep -q "interface\|type\|export" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Type definitions found"
    else
        log_warning "Type definitions not found"
    fi
    
    # Check for comments
    increment_check
    if grep -q "//\|#\|/\*" "aws-deployment/lambda/chat-service/index.js" 2>/dev/null; then
        log_success "Code comments found"
    else
        log_warning "Code comments not found"
    fi
    
    echo ""
}

# Generate review report
generate_report() {
    echo ""
    echo "📊 System Architect Review Report"
    echo "================================="
    echo ""
    echo "Total Checks: $TOTAL_CHECKS"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"
    echo "Warnings: $WARNINGS"
    echo ""
    
    # Calculate success rate
    if [ $TOTAL_CHECKS -gt 0 ]; then
        success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        echo "Success Rate: $success_rate%"
        echo ""
        
        if [ $success_rate -ge 90 ]; then
            echo "🎉 EXCELLENT! Code is ready for deployment"
            return 0
        elif [ $success_rate -ge 80 ]; then
            echo "✅ GOOD! Code is ready for deployment with minor fixes"
            return 0
        elif [ $success_rate -ge 70 ]; then
            echo "⚠️  FAIR! Code needs improvements before deployment"
            return 1
        else
            echo "❌ POOR! Code needs significant work before deployment"
            return 1
        fi
    else
        echo "❌ No checks were performed"
        return 1
    fi
}

# Main review function
main() {
    echo "🏗️  System Architect Code Review"
    echo "================================="
    echo ""
    echo "Reviewing code for AWS deployment readiness..."
    echo ""
    
    # Run all review checks
    check_aws_compatibility
    check_security
    check_performance
    check_integration
    check_code_quality
    check_documentation
    
    # Generate final report
    generate_report
    
    return $?
}

# Handle script arguments
case "${1:-}" in
    "aws")
        check_aws_compatibility
        ;;
    "security")
        check_security
        ;;
    "performance")
        check_performance
        ;;
    "integration")
        check_integration
        ;;
    "quality")
        check_code_quality
        ;;
    "docs")
        check_documentation
        ;;
    *)
        main
        ;;
esac
