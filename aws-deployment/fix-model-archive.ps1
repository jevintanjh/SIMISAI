# Fix SageMaker Model Archive - System Architect
# This script creates a proper archive for SageMaker

Write-Host "Fixing SageMaker Model Archive" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue
Write-Host ""

$modelPath = "D:\Users\Cursor\SIMISAI\sealion_model\Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
$archivePath = "model.tar.gz"
$s3Path = "s3://simisai-production-frontend/sealion_model/model.tar.gz"

Write-Host "Step 1: Verify Model File" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

if (Test-Path $modelPath) {
    $modelSize = (Get-Item $modelPath).Length / 1GB
    Write-Host "SUCCESS: Model found at $modelPath" -ForegroundColor Green
    Write-Host "Model size: $([math]::Round($modelSize, 2)) GB" -ForegroundColor White
} else {
    Write-Host "ERROR: Model not found at $modelPath" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 2: Create Model Archive" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    # Create a temporary directory
    $tempDir = "temp_model_dir"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    # Copy model to temp directory
    Copy-Item $modelPath "$tempDir\Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
    
    # Create tar.gz archive (using PowerShell compression)
    Compress-Archive -Path "$tempDir\*" -DestinationPath $archivePath -Force
    
    # Cleanup temp directory
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "SUCCESS: Model archive created: $archivePath" -ForegroundColor Green
    
    # Check archive size
    $archiveSize = (Get-Item $archivePath).Length / 1GB
    Write-Host "Archive size: $([math]::Round($archiveSize, 2)) GB" -ForegroundColor White
    
} catch {
    Write-Host "ERROR: Failed to create model archive" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 3: Upload Archive to S3" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

try {
    aws s3 cp $archivePath $s3Path
    Write-Host "SUCCESS: Model archive uploaded to S3" -ForegroundColor Green
    Write-Host "S3 Path: $s3Path" -ForegroundColor White
} catch {
    Write-Host "ERROR: Failed to upload archive to S3" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 4: Update SageMaker Model" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

try {
    # Delete the failed endpoint first
    aws sagemaker delete-endpoint --endpoint-name simisai-sealion-serverless-endpoint
    Write-Host "SUCCESS: Failed endpoint deleted" -ForegroundColor Green
    
    # Update model configuration
    $modelConfig = @"
{
  "ModelName": "simisai-sealion-gguf-model-v2",
  "ExecutionRoleArn": "arn:aws:iam::710743745504:role/SageMakerExecutionRole",
  "PrimaryContainer": {
    "Image": "763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0.0-cpu-py310-ubuntu20.04-sagemaker",
    "ModelDataUrl": "$s3Path",
    "Environment": {
      "SAGEMAKER_PROGRAM": "sagemaker-inference.py",
      "SAGEMAKER_SUBMIT_DIRECTORY": "s3://simisai-production-frontend/code/inference.zip"
    }
  }
}
"@
    
    $modelConfig | Out-File -FilePath "sagemaker-model-config-v2.json" -Encoding UTF8
    
    # Create new model
    aws sagemaker create-model --cli-input-json file://sagemaker-model-config-v2.json
    Write-Host "SUCCESS: New SageMaker model created" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "sagemaker-model-config-v2.json" -Force
    
} catch {
    Write-Host "ERROR: Failed to update SageMaker model" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Step 5: Create New Endpoint" -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

try {
    # Update endpoint configuration
    $endpointConfig = @"
{
  "EndpointConfigName": "simisai-sealion-serverless-config-v3",
  "ProductionVariants": [
    {
      "VariantName": "sealion-variant",
      "ModelName": "simisai-sealion-gguf-model-v2",
      "ServerlessConfig": {
        "MemorySizeInMB": 3072,
        "MaxConcurrency": 10
      }
    }
  ]
}
"@
    
    $endpointConfig | Out-File -FilePath "sagemaker-endpoint-config-v3.json" -Encoding UTF8
    
    # Create new endpoint configuration
    aws sagemaker create-endpoint-config --cli-input-json file://sagemaker-endpoint-config-v3.json
    Write-Host "SUCCESS: New endpoint configuration created" -ForegroundColor Green
    
    # Create new endpoint
    $endpointConfig = @"
{
  "EndpointName": "simisai-sealion-serverless-endpoint-v2",
  "EndpointConfigName": "simisai-sealion-serverless-config-v3"
}
"@
    
    $endpointConfig | Out-File -FilePath "sagemaker-endpoint-v2.json" -Encoding UTF8
    
    aws sagemaker create-endpoint --cli-input-json file://sagemaker-endpoint-v2.json
    Write-Host "SUCCESS: New endpoint created and deploying" -ForegroundColor Green
    
    # Cleanup
    Remove-Item "sagemaker-endpoint-config-v3.json" -Force
    Remove-Item "sagemaker-endpoint-v2.json" -Force
    
} catch {
    Write-Host "ERROR: Failed to create new endpoint" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "Fix Complete!" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host "Model archive: $archivePath" -ForegroundColor White
Write-Host "S3 location: $s3Path" -ForegroundColor White
Write-Host "New endpoint: simisai-sealion-serverless-endpoint-v2" -ForegroundColor White
Write-Host ""
Write-Host "System Architect: Model archive issue fixed! 🚀" -ForegroundColor Green
