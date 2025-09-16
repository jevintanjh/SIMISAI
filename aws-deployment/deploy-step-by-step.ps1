# Step-by-Step AWS Deployment - System Architect
# This script deploys SIMISAI infrastructure step by step

Write-Host "SIMISAI AWS Deployment - System Architect" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

$bucketName = "simisai-production-frontend"
$stackName = "simisai-production"
$region = "us-east-1"

Write-Host "Step 1: Creating S3 Bucket for Frontend" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

try {
    $result = aws s3 mb "s3://$bucketName" --region $region
    if ($result) {
        Write-Host "SUCCESS: S3 bucket created: $bucketName" -ForegroundColor Green
    } else {
        Write-Host "INFO: S3 bucket may already exist" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to create S3 bucket" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 2: Setting up S3 Bucket for Web Hosting" -ForegroundColor Cyan
Write-Host "---------------------------------------------" -ForegroundColor Cyan

try {
    # Enable static website hosting
    aws s3 website "s3://$bucketName" --index-document index.html --error-document error.html
    Write-Host "SUCCESS: S3 bucket configured for web hosting" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to configure S3 bucket for web hosting" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 3: Creating Lambda Function for Chat Service" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan

try {
    # Create a simple Lambda function
    $lambdaCode = @"
exports.handler = async (event) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'SIMISAI Chat Service - System Architect Deployment',
            timestamp: new Date().toISOString()
        })
    };
};
"@
    
    $lambdaCode | Out-File -FilePath "chat-service-temp.js" -Encoding UTF8
    
    # Create deployment package
    Compress-Archive -Path "chat-service-temp.js" -DestinationPath "chat-service.zip" -Force
    
    # Create Lambda function
    aws lambda create-function `
        --function-name "simisai-chat-service" `
        --runtime "nodejs18.x" `
        --role "arn:aws:iam::710743745504:role/lambda-execution-role" `
        --handler "chat-service-temp.handler" `
        --zip-file "fileb://chat-service.zip" `
        --region $region
    
    Write-Host "SUCCESS: Lambda function created for chat service" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "chat-service-temp.js" -Force
    Remove-Item "chat-service.zip" -Force
    
} catch {
    Write-Host "ERROR: Failed to create Lambda function" -ForegroundColor Red
    Write-Host "Note: You may need to create an IAM role first" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 4: Creating API Gateway" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    # Create REST API
    $apiId = aws apigateway create-rest-api --name "simisai-api" --region $region --query 'id' --output text
    if ($apiId) {
        Write-Host "SUCCESS: API Gateway created with ID: $apiId" -ForegroundColor Green
        
        # Get root resource
        $rootResourceId = aws apigateway get-resources --rest-api-id $apiId --region $region --query 'items[0].id' --output text
        
        # Create /chat resource
        $chatResourceId = aws apigateway create-resource --rest-api-id $apiId --parent-id $rootResourceId --path-part "chat" --region $region --query 'id' --output text
        
        # Create POST method
        aws apigateway put-method --rest-api-id $apiId --resource-id $chatResourceId --http-method POST --authorization-type NONE --region $region
        
        Write-Host "SUCCESS: API Gateway endpoints configured" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Failed to create API Gateway" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 5: Testing SageMaker Access" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

try {
    $endpoints = aws sagemaker list-endpoints --region $region
    if ($endpoints) {
        Write-Host "SUCCESS: SageMaker access confirmed" -ForegroundColor Green
        Write-Host "Ready to set up Sealion LLM endpoint" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: SageMaker access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 6: Testing RDS Access" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    $instances = aws rds describe-db-instances --region $region
    if ($instances) {
        Write-Host "SUCCESS: RDS access confirmed" -ForegroundColor Green
        Write-Host "Ready to create PostgreSQL database" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: RDS access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Deployment Summary" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "S3 Bucket: $bucketName" -ForegroundColor White
Write-Host "Lambda Function: simisai-chat-service" -ForegroundColor White
Write-Host "API Gateway: simisai-api" -ForegroundColor White
Write-Host "Region: $region" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Set up SageMaker endpoint for Sealion LLM" -ForegroundColor White
Write-Host "2. Create RDS PostgreSQL database" -ForegroundColor White
Write-Host "3. Deploy frontend to S3 bucket" -ForegroundColor White
Write-Host "4. Test end-to-end functionality" -ForegroundColor White
Write-Host "5. Coordinate with co-worker for CV service" -ForegroundColor White
Write-Host ""

Write-Host "System Architect deployment orchestration complete!" -ForegroundColor Green
