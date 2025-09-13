# Deploy Hybrid LLM Lambda Function
# System Architect - SIMISAI AWS Deployment

Write-Host "🚀 Deploying Hybrid LLM Lambda Function..." -ForegroundColor Green

# Set function name
$FunctionName = "simisai-hybrid-llm-service"

# Check if function exists
Write-Host "Checking if function exists..." -ForegroundColor Yellow
$FunctionExists = aws lambda get-function --function-name $FunctionName 2>$null

if ($FunctionExists) {
    Write-Host "Function exists. Updating code..." -ForegroundColor Yellow
    
    # Update existing function
    aws lambda update-function-code --function-name $FunctionName --zip-file fileb://hybrid-deployment.zip
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Function code updated successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to update function code" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Function doesn't exist. Creating new function..." -ForegroundColor Yellow
    
    # Create new function
    aws lambda create-function `
        --function-name $FunctionName `
        --runtime nodejs18.x `
        --role arn:aws:iam::710743745504:role/lambda-execution-role `
        --handler hybrid-llm-service.handler `
        --zip-file fileb://hybrid-deployment.zip `
        --timeout 30 `
        --memory-size 512
        
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Function created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create function" -ForegroundColor Red
        exit 1
    }
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
aws lambda update-function-configuration --function-name $FunctionName --environment Variables='{
    "SAGEMAKER_ENDPOINT": "simisai-sealion-realtime-endpoint",
    "AWS_REGION": "us-east-1",
    "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY_HERE"
}'

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Environment variables set!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Failed to set environment variables" -ForegroundColor Yellow
}

# Test the function
Write-Host "Testing function..." -ForegroundColor Yellow
$TestPayload = @{
    body = '{"messages":[{"role":"user","content":"Hello, how are you?"}]}'
} | ConvertTo-Json

aws lambda invoke --function-name $FunctionName --payload $TestPayload response.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Function test completed!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Get-Content response.json | ConvertFrom-Json | ConvertTo-Json -Depth 3
} else {
    Write-Host "❌ Function test failed" -ForegroundColor Red
}

Write-Host "🎉 Hybrid LLM Lambda deployment complete!" -ForegroundColor Green
