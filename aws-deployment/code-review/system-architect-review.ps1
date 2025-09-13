# System Architect Review for Windows PowerShell
# Comprehensive review before commit and deployment

param(
    [string]$Category = "all"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Purple = "Magenta"

# Review counters
$script:TotalChecks = 0
$script:PassedChecks = 0
$script:FailedChecks = 0
$script:Warnings = 0

# Logging functions
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[✅ PASS] $Message" -ForegroundColor $Green
    $script:PassedChecks++
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[⚠️  WARN] $Message" -ForegroundColor $Yellow
    $script:Warnings++
}

function Log-Error {
    param([string]$Message)
    Write-Host "[❌ FAIL] $Message" -ForegroundColor $Red
    $script:FailedChecks++
}

function Log-Header {
    param([string]$Message)
    Write-Host "[🔍 REVIEW] $Message" -ForegroundColor $Purple
}

function Increment-Check {
    $script:TotalChecks++
}

# Check AWS compatibility
function Test-AWSCompatibility {
    Log-Header "AWS Compatibility Review"
    Write-Host "=================================="
    
    # Check Lambda functions directory
    Increment-Check
    if (Test-Path "aws-deployment/lambda") {
        Log-Success "Lambda functions directory found"
    } else {
        Log-Error "Lambda functions directory missing"
        return $false
    }
    
    # Check chat service Lambda
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        Log-Success "Chat service Lambda function found"
        
        # Check for AWS SDK usage
        Increment-Check
        if (Test-Path "aws-deployment/lambda/chat-service/package.json") {
            $packageContent = Get-Content "aws-deployment/lambda/chat-service/package.json" -Raw
            if ($packageContent -match "@aws-sdk") {
                Log-Success "AWS SDK dependencies found in chat service"
            } else {
                Log-Error "AWS SDK dependencies missing in chat service"
            }
        }
        
        # Check for SageMaker integration
        Increment-Check
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "SageMakerRuntimeClient") {
            Log-Success "SageMaker integration found in chat service"
        } else {
            Log-Error "SageMaker integration missing in chat service"
        }
    } else {
        Log-Error "Chat service Lambda function missing"
    }
    
    # Check CV service Lambda
    Increment-Check
    if (Test-Path "aws-deployment/lambda/cv-service/index.py") {
        Log-Success "CV service Lambda function found"
        
        # Check for CV service integration
        Increment-Check
        $cvContent = Get-Content "aws-deployment/lambda/cv-service/index.py" -Raw
        if ($cvContent -match "CV_SERVICE_ENDPOINT") {
            Log-Success "CV service integration found"
        } else {
            Log-Error "CV service integration missing"
        }
    } else {
        Log-Error "CV service Lambda function missing"
    }
    
    # Check CloudFormation template
    Increment-Check
    if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
        Log-Success "CloudFormation template found"
        
        # Check for required resources
        Increment-Check
        $cfContent = Get-Content "aws-deployment/infrastructure/cloudformation-template.yaml" -Raw
        if ($cfContent -match "AWS::Lambda::Function") {
            Log-Success "Lambda functions defined in CloudFormation"
        } else {
            Log-Error "Lambda functions missing in CloudFormation"
        }
        
        Increment-Check
        if ($cfContent -match "AWS::ApiGateway::RestApi") {
            Log-Success "API Gateway defined in CloudFormation"
        } else {
            Log-Error "API Gateway missing in CloudFormation"
        }
        
        Increment-Check
        if ($cfContent -match "AWS::RDS::DBInstance") {
            Log-Success "RDS database defined in CloudFormation"
        } else {
            Log-Error "RDS database missing in CloudFormation"
        }
    } else {
        Log-Error "CloudFormation template missing"
    }
    
    # Check deployment script
    Increment-Check
    if (Test-Path "aws-deployment/deploy.sh") {
        Log-Success "Deployment script found"
    } else {
        Log-Error "Deployment script missing"
    }
    
    Write-Host ""
}

# Check security configuration
function Test-Security {
    Log-Header "Security Configuration Review"
    Write-Host "=================================="
    
    # Check for hardcoded secrets
    Increment-Check
    $secrets = Get-ChildItem -Path "aws-deployment" -Recurse -File | 
        Where-Object { $_.Extension -notin @(".md", ".txt", ".json", ".yaml", ".yml") } |
        ForEach-Object { Get-Content $_.FullName -Raw } |
        Where-Object { $_ -match "password|secret|key" -and $_ -notmatch "process\.env|os\.environ" }
    
    if ($secrets) {
        Log-Error "Potential hardcoded secrets found"
        Write-Host "  Found in: $($secrets.Count) files" -ForegroundColor $Yellow
    } else {
        Log-Success "No hardcoded secrets found"
    }
    
    # Check IAM policies
    Increment-Check
    if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
        $cfContent = Get-Content "aws-deployment/infrastructure/cloudformation-template.yaml" -Raw
        if ($cfContent -match "Effect.*Allow") {
            Log-Success "IAM policies configured"
        } else {
            Log-Error "IAM policies missing"
        }
        
        # Check security groups
        Increment-Check
        if ($cfContent -match "SecurityGroup") {
            Log-Success "Security groups configured"
        } else {
            Log-Error "Security groups missing"
        }
        
        # Check VPC configuration
        Increment-Check
        if ($cfContent -match "AWS::EC2::VPC") {
            Log-Success "VPC configuration found"
        } else {
            Log-Error "VPC configuration missing"
        }
    }
    
    # Check CORS configuration
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "Access-Control-Allow-Origin") {
            Log-Success "CORS headers configured in chat service"
        } else {
            Log-Warning "CORS headers not found in chat service"
        }
    }
    
    Write-Host ""
}

# Check performance optimization
function Test-Performance {
    Log-Header "Performance Optimization Review"
    Write-Host "===================================="
    
    # Check Lambda memory configuration
    Increment-Check
    if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
        $cfContent = Get-Content "aws-deployment/infrastructure/cloudformation-template.yaml" -Raw
        if ($cfContent -match "MemorySize") {
            Log-Success "Lambda memory configuration found"
        } else {
            Log-Error "Lambda memory configuration missing"
        }
        
        # Check timeout configuration
        Increment-Check
        if ($cfContent -match "Timeout") {
            Log-Success "Lambda timeout configuration found"
        } else {
            Log-Error "Lambda timeout configuration missing"
        }
        
        # Check CloudFront configuration
        Increment-Check
        if ($cfContent -match "CloudFront") {
            Log-Success "CloudFront configuration found"
        } else {
            Log-Error "CloudFront configuration missing"
        }
    }
    
    # Check database connection pooling
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "Pool|pool") {
            Log-Success "Database connection pooling found"
        } else {
            Log-Warning "Database connection pooling not found"
        }
    }
    
    # Check error handling
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "try|catch|error") {
            Log-Success "Error handling implemented in chat service"
        } else {
            Log-Warning "Error handling not found in chat service"
        }
    }
    
    Write-Host ""
}

# Check integration readiness
function Test-Integration {
    Log-Header "Integration Readiness Review"
    Write-Host "================================"
    
    # Check SageMaker integration
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "SAGEMAKER_ENDPOINT") {
            Log-Success "SageMaker integration found"
        } else {
            Log-Error "SageMaker integration missing"
        }
    }
    
    # Check CV service integration
    Increment-Check
    if (Test-Path "aws-deployment/lambda/cv-service/index.py") {
        $cvContent = Get-Content "aws-deployment/lambda/cv-service/index.py" -Raw
        if ($cvContent -match "CV_SERVICE_ENDPOINT") {
            Log-Success "CV service integration found"
        } else {
            Log-Error "CV service integration missing"
        }
    }
    
    # Check database integration
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "DATABASE_URL") {
            Log-Success "Database integration found"
        } else {
            Log-Error "Database integration missing"
        }
    }
    
    # Check environment variables
    Increment-Check
    if (Test-Path "aws-deployment/infrastructure/cloudformation-template.yaml") {
        $cfContent = Get-Content "aws-deployment/infrastructure/cloudformation-template.yaml" -Raw
        if ($cfContent -match "Environment:") {
            Log-Success "Environment variables configured"
        } else {
            Log-Error "Environment variables missing"
        }
    }
    
    # Check fallback mechanisms
    Increment-Check
    if (Test-Path "aws-deployment/lambda/chat-service/index.js") {
        $chatContent = Get-Content "aws-deployment/lambda/chat-service/index.js" -Raw
        if ($chatContent -match "fallback|Fallback") {
            Log-Success "Fallback mechanisms implemented"
        } else {
            Log-Warning "Fallback mechanisms not found"
        }
    }
    
    Write-Host ""
}

# Generate review report
function Generate-Report {
    Write-Host ""
    Write-Host "📊 System Architect Review Report" -ForegroundColor $Purple
    Write-Host "=================================" -ForegroundColor $Purple
    Write-Host ""
    Write-Host "Total Checks: $script:TotalChecks"
    Write-Host "Passed: $script:PassedChecks" -ForegroundColor $Green
    Write-Host "Failed: $script:FailedChecks" -ForegroundColor $Red
    Write-Host "Warnings: $script:Warnings" -ForegroundColor $Yellow
    Write-Host ""
    
    # Calculate success rate
    if ($script:TotalChecks -gt 0) {
        $successRate = [math]::Round(($script:PassedChecks / $script:TotalChecks) * 100, 1)
        Write-Host "Success Rate: $successRate%"
        Write-Host ""
        
        if ($successRate -ge 90) {
            Write-Host "🎉 EXCELLENT! Code is ready for deployment" -ForegroundColor $Green
            return $true
        } elseif ($successRate -ge 80) {
            Write-Host "✅ GOOD! Code is ready for deployment with minor fixes" -ForegroundColor $Green
            return $true
        } elseif ($successRate -ge 70) {
            Write-Host "⚠️  FAIR! Code needs improvements before deployment" -ForegroundColor $Yellow
            return $false
        } else {
            Write-Host "❌ POOR! Code needs significant work before deployment" -ForegroundColor $Red
            return $false
        }
    } else {
        Write-Host "❌ No checks were performed" -ForegroundColor $Red
        return $false
    }
}

# Main review function
function Start-Review {
    Write-Host "🏗️  System Architect Code Review" -ForegroundColor $Purple
    Write-Host "=================================" -ForegroundColor $Purple
    Write-Host ""
    Write-Host "Reviewing code for AWS deployment readiness..." -ForegroundColor $Blue
    Write-Host ""
    
    # Run review checks based on category
    switch ($Category.ToLower()) {
        "aws" { Test-AWSCompatibility }
        "security" { Test-Security }
        "performance" { Test-Performance }
        "integration" { Test-Integration }
        "all" {
            Test-AWSCompatibility
            Test-Security
            Test-Performance
            Test-Integration
        }
        default {
            Write-Host "❌ Invalid category. Use: aws, security, performance, integration, or all" -ForegroundColor $Red
            exit 1
        }
    }
    
    # Generate final report
    $result = Generate-Report
    return $result
}

# Run the review
$reviewResult = Start-Review

if ($reviewResult) {
    exit 0
} else {
    exit 1
}
