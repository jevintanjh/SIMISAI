# Simple AWS Access Audit - System Architect
# This script checks what AWS services you have access to

Write-Host "AWS Access Audit - System Architect" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

# Check AWS CLI configuration
Write-Host "1. AWS CLI Configuration" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

try {
    $config = aws configure list
    Write-Host "Configuration:" -ForegroundColor White
    Write-Host $config -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR: Cannot access AWS CLI" -ForegroundColor Red
    Write-Host ""
}

# Test authentication
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
}
Write-Host ""

# Test core services
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

# Test basic permissions
Write-Host "4. Basic Permissions Test" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

$permissionTests = @(
    @{Name="List S3 Buckets"; Command="aws s3 ls"},
    @{Name="List Lambda Functions"; Command="aws lambda list-functions"},
    @{Name="List CloudFormation Stacks"; Command="aws cloudformation list-stacks"},
    @{Name="List API Gateway APIs"; Command="aws apigateway get-rest-apis"},
    @{Name="List SageMaker Endpoints"; Command="aws sagemaker list-endpoints"},
    @{Name="List RDS Instances"; Command="aws rds describe-db-instances"},
    @{Name="List CloudFront Distributions"; Command="aws cloudfront list-distributions"},
    @{Name="Get IAM User"; Command="aws iam get-user"}
)

foreach ($test in $permissionTests) {
    Write-Host "Testing $($test.Name)..." -ForegroundColor White -NoNewline
    try {
        $result = Invoke-Expression $test.Command 2>$null
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

# Summary
Write-Host "5. Summary and Recommendations" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan

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
