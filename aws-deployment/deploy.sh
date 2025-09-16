#!/bin/bash

# SIMISAI AWS Deployment Script
# System Architect Orchestration Script

set -e

# Configuration
STACK_NAME="simisai-production"
REGION="us-east-1"
ENVIRONMENT="production"
DOMAIN_NAME="simisai.com"
SAGEMAKER_ENDPOINT="sealion-chat-endpoint"
CV_SERVICE_ENDPOINT="https://cv-service.example.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "infrastructure/cloudformation-template.yaml" ]; then
        log_error "Please run this script from the aws-deployment directory"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Deploy infrastructure
deploy_infrastructure() {
    log_info "Deploying AWS infrastructure..."
    
    # Generate random password for database
    DB_PASSWORD=$(openssl rand -base64 32)
    
    # Deploy CloudFormation stack
    aws cloudformation deploy \
        --template-file infrastructure/cloudformation-template.yaml \
        --stack-name $STACK_NAME \
        --parameter-overrides \
            Environment=$ENVIRONMENT \
            DomainName=$DOMAIN_NAME \
            SageMakerEndpointName=$SAGEMAKER_ENDPOINT \
            CVServiceEndpoint=$CV_SERVICE_ENDPOINT \
            DatabasePassword=$DB_PASSWORD \
        --capabilities CAPABILITY_IAM \
        --region $REGION
    
    if [ $? -eq 0 ]; then
        log_success "Infrastructure deployed successfully"
    else
        log_error "Infrastructure deployment failed"
        exit 1
    fi
}

# Deploy Lambda functions
deploy_lambda_functions() {
    log_info "Deploying Lambda functions..."
    
    # Deploy chat service
    log_info "Deploying chat service..."
    cd lambda/chat-service
    npm install --production
    zip -r chat-service.zip .
    aws lambda update-function-code \
        --function-name $STACK_NAME-chat-function \
        --zip-file fileb://chat-service.zip \
        --region $REGION
    rm chat-service.zip
    cd ../..
    
    # Deploy CV service
    log_info "Deploying CV service..."
    cd lambda/cv-service
    pip install -r requirements.txt -t .
    zip -r cv-service.zip .
    aws lambda update-function-code \
        --function-name $STACK_NAME-cv-function \
        --zip-file fileb://cv-service.zip \
        --region $REGION
    rm cv-service.zip
    cd ../..
    
    log_success "Lambda functions deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend to S3..."
    
    # Build frontend
    cd ..
    npm run build
    
    # Get S3 bucket name from CloudFormation
    BUCKET_NAME=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
        --output text)
    
    # Sync to S3
    aws s3 sync dist/ s3://$BUCKET_NAME --delete --exclude "sealion_model/*"
    
    # Invalidate CloudFront cache
    DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
        --output text)
    
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*"
    
    cd aws-deployment
    log_success "Frontend deployed successfully"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."
    
    # Get API Gateway URL
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayURL`].OutputValue' \
        --output text)
    
    # Test chat endpoint
    log_info "Testing chat endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"message":"Hello, test message","sessionId":"test-session"}' \
        $API_URL/chat)
    
    if [ "$response" = "200" ]; then
        log_success "Chat endpoint test passed"
    else
        log_warning "Chat endpoint test failed (HTTP $response)"
    fi
    
    # Test CV endpoint
    log_info "Testing CV endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"image":"test","device_type":"thermometer"}' \
        $API_URL/cv)
    
    if [ "$response" = "200" ]; then
        log_success "CV endpoint test passed"
    else
        log_warning "CV endpoint test failed (HTTP $response)"
    fi
}

# Show deployment information
show_deployment_info() {
    log_info "Deployment Information:"
    
    # Get outputs from CloudFormation
    FRONTEND_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
        --output text)
    
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayURL`].OutputValue' \
        --output text)
    
    WEBSOCKET_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`WebSocketURL`].OutputValue' \
        --output text)
    
    DATABASE_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
        --output text)
    
    echo ""
    echo "=========================================="
    echo "🚀 SIMISAI AWS Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "📱 Frontend URL: https://$FRONTEND_URL"
    echo "🔌 API URL: $API_URL"
    echo "💬 WebSocket URL: $WEBSOCKET_URL"
    echo "🗄️  Database: $DATABASE_ENDPOINT"
    echo ""
    echo "📊 Monitoring:"
    echo "   - CloudWatch: https://console.aws.amazon.com/cloudwatch/"
    echo "   - Lambda: https://console.aws.amazon.com/lambda/"
    echo "   - API Gateway: https://console.aws.amazon.com/apigateway/"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Configure custom domain (if needed)"
    echo "   2. Set up monitoring and alerting"
    echo "   3. Test end-to-end functionality"
    echo "   4. Coordinate with co-worker on CV service"
    echo ""
    echo "=========================================="
}

# Main deployment function
main() {
    echo "🏗️  SIMISAI AWS Deployment Orchestrator"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    deploy_infrastructure
    deploy_lambda_functions
    deploy_frontend
    test_deployment
    show_deployment_info
    
    log_success "Deployment orchestration completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "infrastructure")
        check_prerequisites
        deploy_infrastructure
        ;;
    "lambda")
        check_prerequisites
        deploy_lambda_functions
        ;;
    "frontend")
        check_prerequisites
        deploy_frontend
        ;;
    "test")
        check_prerequisites
        test_deployment
        ;;
    "info")
        show_deployment_info
        ;;
    *)
        main
        ;;
esac
