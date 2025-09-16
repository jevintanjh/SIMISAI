# SageMaker Endpoint Monitor - System Architect
# This script monitors the endpoint deployment status

Write-Host "SageMaker Endpoint Monitor" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue
Write-Host ""

$endpointName = "simisai-sealion-serverless-endpoint"
$maxAttempts = 60  # Monitor for up to 10 minutes (60 * 10 seconds)
$attempt = 0

Write-Host "Monitoring endpoint: $endpointName" -ForegroundColor Cyan
Write-Host "Checking every 10 seconds..." -ForegroundColor Cyan
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        $status = aws sagemaker describe-endpoint --endpoint-name $endpointName --query 'EndpointStatus' --output text 2>$null
        
        if ($status) {
            Write-Host "Attempt $attempt`: Status = $status" -ForegroundColor White
            
            if ($status -eq "InService") {
                Write-Host ""
                Write-Host "🎉 ENDPOINT IS READY!" -ForegroundColor Green
                Write-Host "=========================" -ForegroundColor Green
                Write-Host "Endpoint: $endpointName" -ForegroundColor White
                Write-Host "Status: $status" -ForegroundColor Green
                Write-Host "Ready for inference!" -ForegroundColor Green
                Write-Host ""
                
                # Get endpoint details
                $endpointDetails = aws sagemaker describe-endpoint --endpoint-name $endpointName --query 'EndpointArn' --output text
                Write-Host "Endpoint ARN: $endpointDetails" -ForegroundColor White
                Write-Host ""
                
                Write-Host "Next Steps:" -ForegroundColor Blue
                Write-Host "1. Test SageMaker inference" -ForegroundColor White
                Write-Host "2. Update Lambda function" -ForegroundColor White
                Write-Host "3. Test end-to-end chat flow" -ForegroundColor White
                Write-Host ""
                
                Write-Host "System Architect: Endpoint deployment complete! 🚀" -ForegroundColor Green
                exit 0
                
            } elseif ($status -eq "Failed") {
                Write-Host ""
                Write-Host "❌ ENDPOINT DEPLOYMENT FAILED!" -ForegroundColor Red
                Write-Host "===============================" -ForegroundColor Red
                Write-Host "Status: $status" -ForegroundColor Red
                Write-Host "Please check the endpoint logs for details" -ForegroundColor Yellow
                Write-Host ""
                exit 1
                
            } else {
                # Still deploying
                Write-Host "Status: $status - Still deploying..." -ForegroundColor Yellow
            }
        } else {
            Write-Host "Attempt $attempt`: No status returned" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "Attempt $attempt`: Error checking status" -ForegroundColor Red
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "Waiting 10 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
}

Write-Host ""
Write-Host "⏰ MONITORING TIMEOUT" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "Endpoint deployment is taking longer than expected" -ForegroundColor Yellow
Write-Host "Please check the AWS Console for current status" -ForegroundColor Yellow
Write-Host ""
Write-Host "System Architect: Monitoring complete" -ForegroundColor Blue
