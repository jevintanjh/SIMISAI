# SageMaker Performance Optimization Script
# System Architect - SIMISAI Performance Enhancement

Write-Host "🚀 Optimizing SageMaker Endpoint Performance..." -ForegroundColor Green

# Configuration
$EndpointName = "simisai-sealion-realtime-endpoint"
$NewEndpointName = "simisai-sealion-performance-optimized"
$ConfigName = "simisai-sealion-performance-optimized"
$ModelName = "simisai-sealion-gguf-model-v5"

Write-Host "`n📊 Current SageMaker Endpoint Status:" -ForegroundColor Yellow
aws sagemaker describe-endpoint --endpoint-name $EndpointName --query '{
    EndpointName: EndpointName,
    EndpointStatus: EndpointStatus,
    CreationTime: CreationTime,
    LastModifiedTime: LastModifiedTime
}' --output table

Write-Host "`n🔧 Creating Performance-Optimized Endpoint Configuration..." -ForegroundColor Yellow

# Create optimized endpoint configuration
aws sagemaker create-endpoint-config --cli-input-json file://sagemaker-performance-optimized-config.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Performance-optimized endpoint configuration created" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create optimized endpoint configuration" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Deploying Performance-Optimized Endpoint..." -ForegroundColor Yellow

# Create new optimized endpoint
aws sagemaker create-endpoint --endpoint-name $NewEndpointName --endpoint-config-name $ConfigName

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Performance-optimized endpoint deployment initiated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create optimized endpoint" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Waiting for Endpoint to be Ready..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Cyan

# Wait for endpoint to be ready
$MaxWaitTime = 600 # 10 minutes
$WaitTime = 0
$CheckInterval = 30 # Check every 30 seconds

do {
    Start-Sleep -Seconds $CheckInterval
    $WaitTime += $CheckInterval
    
    $Status = aws sagemaker describe-endpoint --endpoint-name $NewEndpointName --query 'EndpointStatus' --output text 2>$null
    
    if ($Status -eq "InService") {
        Write-Host "✅ Performance-optimized endpoint is ready!" -ForegroundColor Green
        break
    } elseif ($Status -eq "Failed") {
        Write-Host "❌ Endpoint deployment failed" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "⏳ Endpoint status: $Status (waited $WaitTime seconds)" -ForegroundColor Yellow
    }
} while ($WaitTime -lt $MaxWaitTime)

if ($WaitTime -ge $MaxWaitTime) {
    Write-Host "⚠️ Endpoint deployment is taking longer than expected" -ForegroundColor Yellow
    Write-Host "You can check status manually with: aws sagemaker describe-endpoint --endpoint-name $NewEndpointName" -ForegroundColor Cyan
}

Write-Host "`n🧪 Testing Optimized Endpoint..." -ForegroundColor Yellow

# Test the optimized endpoint
$TestPayload = @{
    messages = @(
        @{
            role = "user"
            content = "Test performance optimization"
        }
    )
    max_tokens = 100
    temperature = 0.7
} | ConvertTo-Json -Depth 3

$StartTime = Get-Date
$Response = aws sagemaker-runtime invoke-endpoint --endpoint-name $NewEndpointName --content-type "application/json" --body $TestPayload --output text 2>$null
$EndTime = Get-Date
$ResponseTime = ($EndTime - $StartTime).TotalMilliseconds

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Optimized endpoint test successful" -ForegroundColor Green
    Write-Host "Response time: $([math]::Round($ResponseTime, 2)) ms" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Endpoint test failed, but endpoint may still be initializing" -ForegroundColor Yellow
}

Write-Host "`n📊 Performance Optimization Summary:" -ForegroundColor Yellow

# Display endpoint information
aws sagemaker describe-endpoint --endpoint-name $NewEndpointName --query '{
    EndpointName: EndpointName,
    EndpointStatus: EndpointStatus,
    CreationTime: CreationTime,
    EndpointConfigName: EndpointConfigName
}' --output table

Write-Host "`n🎯 Performance Improvements Applied:" -ForegroundColor Green
Write-Host "✅ Upgraded to ml.m5.2xlarge (8 vCPUs, 32GB RAM)" -ForegroundColor Green
Write-Host "✅ Optimized for faster inference processing" -ForegroundColor Green
Write-Host "✅ Added data capture for performance monitoring" -ForegroundColor Green
Write-Host "✅ Reduced cold start impact with better instance type" -ForegroundColor Green

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update Lambda functions to use new endpoint: $NewEndpointName" -ForegroundColor Cyan
Write-Host "2. Monitor performance metrics in CloudWatch" -ForegroundColor Cyan
Write-Host "3. Test end-to-end performance improvements" -ForegroundColor Cyan
Write-Host "4. Consider retiring old endpoint after validation" -ForegroundColor Cyan

Write-Host "`n🚀 SageMaker Performance Optimization Complete!" -ForegroundColor Green
