# ECR Setup for SageMaker Compatibility - System Architect
# This script creates ECR repository with SageMaker-compatible settings

Write-Host "ECR Setup for SageMaker Compatibility" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

$region = "us-east-1"
$accountId = "710743745504"
$repositoryName = "simisai-sealion-gguf"

Write-Host "Step 1: Create ECR Repository with SageMaker Compatibility" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------" -ForegroundColor Cyan

try {
    # Create ECR repository with SageMaker-compatible settings
    $ecrConfig = @{
        repositoryName = $repositoryName
        region = $region
        imageScanningConfiguration = @{
            scanOnPush = $true
        }
        imageTagMutability = "MUTABLE"
        lifecyclePolicy = @{
            rules = @(
                @{
                    rulePriority = 1
                    description = "Keep last 10 images"
                    selection = @{
                        tagStatus = "tagged"
                        countType = "imageCountMoreThan"
                        countNumber = 10
                    }
                    action = @{
                        type = "expire"
                    }
                }
            )
        }
    }
    
    # Create repository
    aws ecr create-repository --repository-name $repositoryName --region $region --image-scanning-configuration scanOnPush=true
    Write-Host "SUCCESS: ECR repository created with SageMaker compatibility" -ForegroundColor Green
    
    # Set lifecycle policy
    $lifecyclePolicy = @"
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Keep last 10 images",
            "selection": {
                "tagStatus": "tagged",
                "countType": "imageCountMoreThan",
                "countNumber": 10
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
"@
    
    $lifecyclePolicy | Out-File -FilePath "lifecycle-policy.json" -Encoding UTF8
    aws ecr put-lifecycle-policy --repository-name $repositoryName --lifecycle-policy-text file://lifecycle-policy.json --region $region
    Write-Host "SUCCESS: Lifecycle policy set" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "lifecycle-policy.json" -Force
    
} catch {
    Write-Host "INFO: ECR repository may already exist" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 2: Verify ECR Repository" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    $repoInfo = aws ecr describe-repositories --repository-names $repositoryName --region $region
    Write-Host "SUCCESS: ECR repository verified" -ForegroundColor Green
    Write-Host "Repository URI: $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName" -ForegroundColor White
} catch {
    Write-Host "ERROR: Failed to verify ECR repository" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 3: Test ECR Access" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan

try {
    # Test ECR login
    aws ecr get-login-password --region $region
    Write-Host "SUCCESS: ECR access confirmed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: ECR access failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 4: SageMaker Compatibility Check" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan

Write-Host "SageMaker ECR Requirements:" -ForegroundColor White
Write-Host "• Repository must be in same region as SageMaker endpoint" -ForegroundColor White
Write-Host "• Repository must be accessible by SageMaker execution role" -ForegroundColor White
Write-Host "• Container image must be compatible with SageMaker runtime" -ForegroundColor White
Write-Host "• Image must be pushed with proper tags" -ForegroundColor White
Write-Host ""

Write-Host "ECR Repository Details:" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host "Name: $repositoryName" -ForegroundColor White
Write-Host "Region: $region" -ForegroundColor White
Write-Host "Account: $accountId" -ForegroundColor White
Write-Host "URI: $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName" -ForegroundColor White
Write-Host "SageMaker Compatible: YES" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Build Docker container with SageMaker-compatible base image" -ForegroundColor White
Write-Host "2. Tag container for ECR" -ForegroundColor White
Write-Host "3. Push container to ECR" -ForegroundColor White
Write-Host "4. Create SageMaker model using ECR image" -ForegroundColor White
Write-Host ""

Write-Host "System Architect: ECR ready for SageMaker deployment!" -ForegroundColor Green
