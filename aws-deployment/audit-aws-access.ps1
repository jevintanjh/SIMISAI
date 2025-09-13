# AWS Access Audit Script - System Architect
# This script checks what AWS services and permissions you have access to

Write-Host "AWS Access Audit - System Architect" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

# Check AWS CLI configuration
Write-Host "1. AWS CLI Configuration Check" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan

try {
    $config = aws configure list
    Write-Host "AWS CLI Configuration:" -ForegroundColor White
    Write-Host $config -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR: Cannot access AWS CLI configuration" -ForegroundColor Red
    Write-Host ""
}

# Test basic authentication
Write-Host "2. Authentication Test" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan

try {
    $identity = aws sts get-caller-identity --output json 2>$null
    if ($identity) {
        Write-Host "SUCCESS: AWS authentication working" -ForegroundColor Green
        Write-Host "Identity: $identity" -ForegroundColor White
    } else {
        Write-Host "WARNING: Authentication may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Authentication failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test core services required for our deployment
Write-Host "3. Core Services Access Test" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

$services = @(
    @{Name="S3"; Command="aws s3 ls --max-items 1"},
    @{Name="EC2"; Command="aws ec2 describe-regions --region us-east-1 --max-items 1"},
    @{Name="Lambda"; Command="aws lambda list-functions --max-items 1"},
    @{Name="CloudFormation"; Command="aws cloudformation list-stacks --max-items 1"},
    @{Name="API Gateway"; Command="aws apigateway get-rest-apis --max-items 1"},
    @{Name="SageMaker"; Command="aws sagemaker list-endpoints --max-items 1"},
    @{Name="RDS"; Command="aws rds describe-db-instances --max-items 1"},
    @{Name="CloudFront"; Command="aws cloudfront list-distributions --max-items 1"},
    @{Name="IAM"; Command="aws iam get-user --max-items 1"}
)

foreach ($service in $services) {
    Write-Host "Testing $($service.Name)..." -ForegroundColor White -NoNewline
    try {
        $result = Invoke-Expression $service.Command 2>$null
        if ($result -or $LASTEXITCODE -eq 0) {
            Write-Host " [PASS]" -ForegroundColor Green
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [ERROR]" -ForegroundColor Red
    }
}
Write-Host ""

# Test specific permissions needed for our deployment
Write-Host "4. Deployment-Specific Permissions Test" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

$deploymentTests = @(
    @{Name="Create IAM Role"; Command="aws iam create-role --role-name test-role --assume-role-policy-document '{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}' --dry-run"},
    @{Name="Create S3 Bucket"; Command="aws s3 mb s3://test-bucket-$(Get-Random) --dry-run"},
    @{Name="Create Lambda Function"; Command="aws lambda create-function --function-name test-function --runtime nodejs18.x --role arn:aws:iam::123456789012:role/test-role --handler index.handler --zip-file fileb://test.zip --dry-run"},
    @{Name="Create CloudFormation Stack"; Command="aws cloudformation create-stack --stack-name test-stack --template-body '{\"AWSTemplateFormatVersion\":\"2010-09-09\",\"Resources\":{\"TestBucket\":{\"Type\":\"AWS::S3::Bucket\"}}}' --dry-run"},
    @{Name="Create SageMaker Endpoint"; Command="aws sagemaker create-endpoint --endpoint-name test-endpoint --endpoint-config-name test-config --dry-run"}
)

foreach ($test in $deploymentTests) {
    Write-Host "Testing $($test.Name)..." -ForegroundColor White -NoNewline
    try {
        $result = Invoke-Expression $test.Command 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " [PASS]" -ForegroundColor Green
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [ERROR]" -ForegroundColor Red
    }
}
Write-Host ""

# Check current account limits and quotas
Write-Host "5. Account Limits and Quotas" -ForegroundColor Cyan
Write-Host "-----------------------------" -ForegroundColor Cyan

try {
    Write-Host "Checking service quotas..." -ForegroundColor White
    $quotas = @(
        "aws service-quotas get-service-quota --service-code lambda --quota-code L-B99A9384",
        "aws service-quotas get-service-quota --service-code s3 --quota-code L-DC2B2D3D",
        "aws service-quotas get-service-quota --service-code cloudformation --quota-code L-0485CB21"
    )
    
    foreach ($quota in $quotas) {
        try {
            $result = Invoke-Expression $quota 2>$null
            if ($result) {
                Write-Host "Service quota accessible" -ForegroundColor Green
            }
        } catch {
            Write-Host "Service quota check failed" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Cannot check service quotas" -ForegroundColor Yellow
}
Write-Host ""

# Summary and recommendations
Write-Host "6. Summary and Recommendations" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan

Write-Host "Based on the audit results:" -ForegroundColor White
Write-Host ""
Write-Host "REQUIRED for SIMISAI AWS Deployment:" -ForegroundColor Yellow
Write-Host "• CloudFormation: Deploy infrastructure" -ForegroundColor White
Write-Host "• Lambda: Deploy backend functions" -ForegroundColor White
Write-Host "• API Gateway: Create REST APIs" -ForegroundColor White
Write-Host "• S3: Host frontend and store files" -ForegroundColor White
Write-Host "• CloudFront: CDN for frontend" -ForegroundColor White
Write-Host "• RDS: PostgreSQL database" -ForegroundColor White
Write-Host "• SageMaker: Sealion LLM endpoint" -ForegroundColor White
Write-Host "• IAM: Create roles and policies" -ForegroundColor White
Write-Host "• EC2: VPC and networking" -ForegroundColor White
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Fix any authentication issues" -ForegroundColor White
Write-Host "2. Request additional permissions if needed" -ForegroundColor White
Write-Host "3. Test deployment with minimal resources" -ForegroundColor White
Write-Host "4. Coordinate with co-worker for CV service" -ForegroundColor White
Write-Host ""

Write-Host "System Architect is ready to proceed once access is confirmed!" -ForegroundColor Blue
