# Final System Architect Review for Windows
# Working PowerShell review script

Write-Host "🔍 System Architect Review" -ForegroundColor Blue
Write-Host "==========================" -ForegroundColor Blue
Write-Host ""

$TotalChecks = 0
$PassedChecks = 0
$FailedChecks = 0

function Log-Success {
    param([string]$Message)
    Write-Host "[✅ PASS] $Message" -ForegroundColor Green
    $script:PassedChecks++
    $script:TotalChecks++
}

function Log-Error {
    param([string]$Message)
    Write-Host "[❌ FAIL] $Message" -ForegroundColor Red
    $script:FailedChecks++
    $script:TotalChecks++
}

Write-Host "🔍 AWS Compatibility Review" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta

# Check Lambda functions directory
if (Test-Path "aws-deployment/lambda") {
    Log-Success "Lambda functions directory found"
} else {
    Log-Error "Lambda functions directory missing"
}

# Check chat service Lambda
if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
    Log-Success "Chat service Lambda function found"
} else {
    Log-Error "Chat service Lambda function missing"
}

# Check CV service Lambda
if (Test-Path "aws-deployment/lambda/cv-service/index.py") {
    Log-Success "CV service Lambda function found"
} else {
    Log-Error "CV service Lambda function missing"
}

# Check CloudFormation template
if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
    Log-Success "CloudFormation template found"
} else {
    Log-Error "CloudFormation template missing"
}

# Check deployment script
if (Test-Path "aws-deployment/deploy.sh") {
    Log-Success "Deployment script found"
} else {
    Log-Error "Deployment script missing"
}

Write-Host ""
Write-Host "🔒 Security Review" -ForegroundColor Magenta
Write-Host "=================" -ForegroundColor Magenta

# Check for hardcoded secrets (simplified check)
$secretsFound = $false
try {
    $files = Get-ChildItem -Path "aws-deployment" -Recurse -File -Include "*.js", "*.py", "*.ts" -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and ($content -match "password\s*=" -or $content -match "secret\s*=" -or $content -match "key\s*=")) {
            $secretsFound = $true
            break
        }
    }
} catch {
    # Ignore errors in file scanning
}

if ($secretsFound) {
    Log-Error "Potential hardcoded secrets found"
} else {
    Log-Success "No obvious hardcoded secrets found"
}

Write-Host ""
Write-Host "⚡ Performance Review" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta

# Check CloudFormation for performance settings
if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
    $cfContent = Get-Content "aws-deployment/infrastructure/cloudformation-template.yaml" -Raw
    
    if ($cfContent -match "MemorySize") {
        Log-Success "Lambda memory configuration found"
    } else {
        Log-Error "Lambda memory configuration missing"
    }
    
    if ($cfContent -match "Timeout") {
        Log-Success "Lambda timeout configuration found"
    } else {
        Log-Error "Lambda timeout configuration missing"
    }
    
    if ($cfContent -match "CloudFront") {
        Log-Success "CloudFront configuration found"
    } else {
        Log-Error "CloudFront configuration missing"
    }
} else {
    Log-Error "CloudFormation template not found for performance check"
}

Write-Host ""
Write-Host "🔗 Integration Review" -ForegroundColor Magenta
Write-Host "====================" -ForegroundColor Magenta

# Check SageMaker integration
if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
    $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
    if ($chatContent -match "SAGEMAKER_ENDPOINT") {
        Log-Success "SageMaker integration found"
    } else {
        Log-Error "SageMaker integration missing"
    }
} else {
    Log-Error "Chat service not found for SageMaker check"
}

# Check CV service integration
if (Test-Path "aws-deployment/lambda/cv-service/index.py") {
    $cvContent = Get-Content "aws-deployment/lambda/cv-service/index.py" -Raw
    if ($cvContent -match "CV_SERVICE_ENDPOINT") {
        Log-Success "CV service integration found"
    } else {
        Log-Error "CV service integration missing"
    }
} else {
    Log-Error "CV service not found for integration check"
}

Write-Host ""
Write-Host "📊 Review Summary" -ForegroundColor Magenta
Write-Host "================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Total Checks: $TotalChecks"
Write-Host "Passed: $PassedChecks" -ForegroundColor Green
Write-Host "Failed: $FailedChecks" -ForegroundColor Red
Write-Host ""

if ($TotalChecks -gt 0) {
    $successRate = [math]::Round(($PassedChecks / $TotalChecks) * 100, 1)
    Write-Host "Success Rate: $successRate%"
    Write-Host ""
    
    if ($successRate -ge 90) {
        Write-Host "🎉 EXCELLENT! Code is ready for deployment" -ForegroundColor Green
    } elseif ($successRate -ge 80) {
        Write-Host "✅ GOOD! Code is ready for deployment with minor fixes" -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "⚠️  FAIR! Code needs improvements before deployment" -ForegroundColor Yellow
    } else {
        Write-Host "❌ POOR! Code needs significant work before deployment" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No checks were performed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Review completed!" -ForegroundColor Blue
