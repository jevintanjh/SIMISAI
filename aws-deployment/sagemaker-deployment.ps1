# SageMaker GGUF Deployment Script - System Architect
# This script deploys the Sealion GGUF model to SageMaker serverless

Write-Host "SageMaker GGUF Deployment - System Architect" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue
Write-Host ""

$region = "us-east-1"
$accountId = "710743745504"
$repositoryName = "simisai-sealion-gguf"
$modelName = "simisai-sealion-gguf-model"
$endpointConfigName = "simisai-sealion-serverless-config"
$endpointName = "simisai-sealion-serverless-endpoint"
$modelPath = "D:\Users\Cursor\SIMISAI\sealion_model\Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"

Write-Host "Step 1: Verify Model Download" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

if (Test-Path $modelPath) {
    $modelSize = (Get-Item $modelPath).Length / 1GB
    Write-Host "SUCCESS: Model found at $modelPath" -ForegroundColor Green
    Write-Host "Model size: $([math]::Round($modelSize, 2)) GB" -ForegroundColor White
} else {
    Write-Host "ERROR: Model not found at $modelPath" -ForegroundColor Red
    Write-Host "Please ensure the model download is complete" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "Step 2: Create ECR Repository" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

try {
    $existingRepo = aws ecr describe-repositories --repository-names $repositoryName --region $region 2>$null
    if ($existingRepo) {
        Write-Host "SUCCESS: ECR repository already exists" -ForegroundColor Green
    } else {
        aws ecr create-repository --repository-name $repositoryName --region $region
        Write-Host "SUCCESS: ECR repository created" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: Failed to create ECR repository" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 3: Create SageMaker Execution Role" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

try {
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
    
    $existingRole = aws iam get-role --role-name SageMakerExecutionRole 2>$null
    if ($existingRole) {
        Write-Host "SUCCESS: SageMaker execution role already exists" -ForegroundColor Green
    } else {
        aws iam create-role --role-name SageMakerExecutionRole --assume-role-policy-document file://sagemaker-trust-policy.json
        aws iam attach-role-policy --role-name SageMakerExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
        Write-Host "SUCCESS: SageMaker execution role created" -ForegroundColor Green
    }
    
    Remove-Item "sagemaker-trust-policy.json" -Force
} catch {
    Write-Host "ERROR: Failed to create SageMaker execution role" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 4: Upload Model to S3" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    $s3ModelPath = "s3://simisai-production-frontend/sealion_model/"
    aws s3 cp $modelPath $s3ModelPath
    Write-Host "SUCCESS: Model uploaded to S3" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to upload model to S3" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 5: Create SageMaker Model" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan

try {
    $modelConfig = @"
{
  "ModelName": "$modelName",
  "ExecutionRoleArn": "arn:aws:iam::$accountId`:role/SageMakerExecutionRole",
  "PrimaryContainer": {
    "Image": "$accountId.dkr.ecr.$region.amazonaws.com/$repositoryName`:latest",
    "ModelDataUrl": "s3://simisai-production-frontend/sealion_model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf",
    "Environment": {
      "MODEL_PATH": "/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
    }
  }
}
"@
    
    $modelConfig | Out-File -FilePath "model-config.json" -Encoding UTF8
    
    $existingModel = aws sagemaker describe-model --model-name $modelName --region $region 2>$null
    if ($existingModel) {
        Write-Host "SUCCESS: SageMaker model already exists" -ForegroundColor Green
    } else {
        aws sagemaker create-model --cli-input-json file://model-config.json --region $region
        Write-Host "SUCCESS: SageMaker model created" -ForegroundColor Green
    }
    
    Remove-Item "model-config.json" -Force
} catch {
    Write-Host "ERROR: Failed to create SageMaker model" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 6: Create Endpoint Configuration" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan

try {
    $endpointConfig = @"
{
  "EndpointConfigName": "$endpointConfigName",
  "ProductionVariants": [
    {
      "VariantName": "sealion-variant",
      "ModelName": "$modelName",
      "ServerlessConfig": {
        "MemorySizeInMB": 10240,
        "MaxConcurrency": 10
      }
    }
  ]
}
"@
    
    $endpointConfig | Out-File -FilePath "endpoint-config.json" -Encoding UTF8
    
    $existingConfig = aws sagemaker describe-endpoint-config --endpoint-config-name $endpointConfigName --region $region 2>$null
    if ($existingConfig) {
        Write-Host "SUCCESS: Endpoint configuration already exists" -ForegroundColor Green
    } else {
        aws sagemaker create-endpoint-config --cli-input-json file://endpoint-config.json --region $region
        Write-Host "SUCCESS: Endpoint configuration created" -ForegroundColor Green
    }
    
    Remove-Item "endpoint-config.json" -Force
} catch {
    Write-Host "ERROR: Failed to create endpoint configuration" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 7: Create Endpoint" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan

try {
    $existingEndpoint = aws sagemaker describe-endpoint --endpoint-name $endpointName --region $region 2>$null
    if ($existingEndpoint) {
        Write-Host "SUCCESS: Endpoint already exists" -ForegroundColor Green
    } else {
        aws sagemaker create-endpoint --endpoint-name $endpointName --endpoint-config-name $endpointConfigName --region $region
        Write-Host "SUCCESS: Endpoint creation initiated" -ForegroundColor Green
        Write-Host "Note: Endpoint creation may take 10-15 minutes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Failed to create endpoint" -ForegroundColor Red
}
Write-Host ""

Write-Host "Deployment Summary" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "ECR Repository: $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName" -ForegroundColor White
Write-Host "SageMaker Model: $modelName" -ForegroundColor White
Write-Host "Endpoint Config: $endpointConfigName" -ForegroundColor White
Write-Host "Endpoint: $endpointName" -ForegroundColor White
Write-Host "Region: $region" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Blue
Write-Host "1. Build and push Docker container to ECR" -ForegroundColor White
Write-Host "2. Update Lambda function to call SageMaker endpoint" -ForegroundColor White
Write-Host "3. Test end-to-end functionality" -ForegroundColor White
Write-Host "4. Monitor endpoint status and costs" -ForegroundColor White
Write-Host ""

Write-Host "System Architect SageMaker deployment orchestration complete!" -ForegroundColor Green
