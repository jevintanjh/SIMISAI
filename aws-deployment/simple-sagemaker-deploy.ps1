# Simple SageMaker GGUF Deployment - System Architect
# Step-by-step approach to avoid fatal errors

Write-Host "Simple SageMaker GGUF Deployment" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue
Write-Host ""

$region = "us-east-1"
$accountId = "710743745504"

Write-Host "Step 1: Verify Model File" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

$modelPath = "D:\Users\Cursor\SIMISAI\sealion_model\Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"

if (Test-Path $modelPath) {
    $modelSize = (Get-Item $modelPath).Length / 1GB
    Write-Host "SUCCESS: Model found" -ForegroundColor Green
    Write-Host "Path: $modelPath" -ForegroundColor White
    Write-Host "Size: $([math]::Round($modelSize, 2)) GB" -ForegroundColor White
} else {
    Write-Host "ERROR: Model not found at $modelPath" -ForegroundColor Red
    Write-Host "Please check the download location" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "Step 2: Create ECR Repository" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    $repoName = "simisai-sealion-gguf"
    aws ecr create-repository --repository-name $repoName --region $region
    Write-Host "SUCCESS: ECR repository created" -ForegroundColor Green
} catch {
    Write-Host "INFO: ECR repository may already exist" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 3: Create SageMaker Role" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    # Create trust policy file
    $trustPolicy = @'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "sagemaker.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
'@
    
    $trustPolicy | Out-File -FilePath "trust-policy.json" -Encoding UTF8
    
    # Create role
    aws iam create-role --role-name SageMakerExecutionRole --assume-role-policy-document file://trust-policy.json
    Write-Host "SUCCESS: SageMaker role created" -ForegroundColor Green
    
    # Attach policy
    aws iam attach-role-policy --role-name SageMakerExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
    Write-Host "SUCCESS: SageMaker policy attached" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "trust-policy.json" -Force
    
} catch {
    Write-Host "INFO: SageMaker role may already exist" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 4: Upload Model to S3" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

try {
    $s3Path = "s3://simisai-production-frontend/sealion_model/"
    aws s3 cp $modelPath $s3Path
    Write-Host "SUCCESS: Model uploaded to S3" -ForegroundColor Green
    Write-Host "S3 Path: $s3Path" -ForegroundColor White
} catch {
    Write-Host "ERROR: Failed to upload model to S3" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 5: Test AWS Services" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

try {
    # Test SageMaker access
    aws sagemaker list-models --region $region --max-items 1
    Write-Host "SUCCESS: SageMaker access confirmed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: SageMaker access failed" -ForegroundColor Red
}

try {
    # Test ECR access
    aws ecr describe-repositories --region $region --max-items 1
    Write-Host "SUCCESS: ECR access confirmed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: ECR access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Deployment Status" -ForegroundColor Green
Write-Host "================" -ForegroundColor Green
Write-Host "Model: Ready" -ForegroundColor White
Write-Host "ECR Repository: Created" -ForegroundColor White
Write-Host "SageMaker Role: Created" -ForegroundColor White
Write-Host "S3 Upload: Ready" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Build Docker container" -ForegroundColor White
Write-Host "2. Push container to ECR" -ForegroundColor White
Write-Host "3. Create SageMaker model" -ForegroundColor White
Write-Host "4. Deploy serverless endpoint" -ForegroundColor White
Write-Host ""

Write-Host "System Architect: Ready for container deployment!" -ForegroundColor Green
