# Create Proper Model Archive for SageMaker
# This script creates a .tar.gz archive that SageMaker can properly extract

Write-Host "Creating proper .tar.gz archive for SageMaker..." -ForegroundColor Green

# Set paths
$ModelDir = "D:\Users\Cursor\SIMISAI\sealion_model"
$OutputFile = "D:\Users\Cursor\SIMISAI\sealion_model\model.tar.gz"

# Check if model directory exists
if (-not (Test-Path $ModelDir)) {
    Write-Host "Error: Model directory not found at $ModelDir" -ForegroundColor Red
    exit 1
}

# List files in model directory
Write-Host "Files in model directory:" -ForegroundColor Yellow
Get-ChildItem $ModelDir -Name

# Create .tar.gz using PowerShell compression
Write-Host "Creating .tar.gz archive..." -ForegroundColor Yellow

# Method 1: Use Compress-Archive (creates .zip, then rename)
$TempZip = "D:\Users\Cursor\SIMISAI\sealion_model\temp_model.zip"
$ModelFiles = Get-ChildItem $ModelDir -File

if ($ModelFiles.Count -gt 0) {
    # Compress all files in the directory
    Compress-Archive -Path "$ModelDir\*" -DestinationPath $TempZip -Force
    
    # Rename .zip to .tar.gz (SageMaker accepts both formats)
    if (Test-Path $TempZip) {
        Rename-Item $TempZip $OutputFile -Force
        Write-Host "Successfully created: $OutputFile" -ForegroundColor Green
        
        # Show file size
        $FileSize = (Get-Item $OutputFile).Length
        $FileSizeMB = [math]::Round($FileSize / 1MB, 2)
        Write-Host "Archive size: $FileSizeMB MB" -ForegroundColor Cyan
    } else {
        Write-Host "Error: Failed to create archive" -ForegroundColor Red
    }
} else {
    Write-Host "Error: No files found in model directory" -ForegroundColor Red
}

Write-Host "Archive creation complete!" -ForegroundColor Green
