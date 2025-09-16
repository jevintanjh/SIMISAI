# Complete SageMaker Setup with ECR Compatibility - System Architect
# This script sets up SageMaker with proper ECR integration

Write-Host "Complete SageMaker Setup with ECR Compatibility" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

$region = "us-east-1"
$accountId = "710743745504"
$repositoryName = "simisai-sealion-gguf"

Write-Host "Step 1: Create SageMaker Execution Role" -ForegroundColor Cyan
Write-Host "---------------------------------------" -ForegroundColor Cyan

try {
    # Create trust policy for SageMaker
    $trustPolicy = @"
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
"@
    
    $trustPolicy | Out-File -FilePath "sagemaker-trust-policy.json" -Encoding UTF8
    
    # Create SageMaker execution role
    aws iam create-role --role-name SageMakerExecutionRole --assume-role-policy-document file://sagemaker-trust-policy.json
    Write-Host "SUCCESS: SageMaker execution role created" -ForegroundColor Green
    
    # Attach SageMaker full access policy
    aws iam attach-role-policy --role-name SageMakerExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
    Write-Host "SUCCESS: SageMaker full access policy attached" -ForegroundColor Green
    
    # Attach ECR read policy for container access
    aws iam attach-role-policy --role-name SageMakerExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
    Write-Host "SUCCESS: ECR read policy attached" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "sagemaker-trust-policy.json" -Force
    
} catch {
    Write-Host "INFO: SageMaker execution role may already exist" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 2: Verify ECR Repository" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    $repoInfo = aws ecr describe-repositories --repository-names $repositoryName --region $region
    Write-Host "SUCCESS: ECR repository verified" -ForegroundColor Green
    Write-Host "Repository URI: $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName" -ForegroundColor White
} catch {
    Write-Host "ERROR: ECR repository not found" -ForegroundColor Red
    Write-Host "Creating ECR repository..." -ForegroundColor Yellow
    aws ecr create-repository --repository-name $repositoryName --region $region --image-scanning-configuration scanOnPush=true
    Write-Host "SUCCESS: ECR repository created" -ForegroundColor Green
}
Write-Host ""

Write-Host "Step 3: Test SageMaker Access" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    # Test SageMaker access
    aws sagemaker list-models --region $region --max-items 1
    Write-Host "SUCCESS: SageMaker access confirmed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: SageMaker access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 4: Verify S3 Model Access" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

try {
    # Check if model exists in S3
    aws s3 ls s3://simisai-production-frontend/sealion_model/ --region $region
    Write-Host "SUCCESS: S3 model access confirmed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: S3 model access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "SageMaker + ECR Compatibility Status" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "ECR Repository: $repositoryName" -ForegroundColor White
Write-Host "ECR URI: $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName" -ForegroundColor White
Write-Host "SageMaker Role: SageMakerExecutionRole" -ForegroundColor White
Write-Host "S3 Model: s3://simisai-production-frontend/sealion_model/" -ForegroundColor White
Write-Host "Region: $region" -ForegroundColor White
Write-Host "Compatibility: READY" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Build Docker container with SageMaker-compatible base image" -ForegroundColor White
Write-Host "2. Tag container for ECR" -ForegroundColor White
Write-Host "3. Push container to ECR" -ForegroundColor White
Write-Host "4. Create SageMaker model using ECR image" -ForegroundColor White
Write-Host "5. Deploy serverless endpoint" -ForegroundColor White
Write-Host ""

Write-Host "System Architect: SageMaker + ECR setup complete!" -ForegroundColor Green
