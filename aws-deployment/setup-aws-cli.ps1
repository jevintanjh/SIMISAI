# AWS CLI Setup Script - System Architect
# This script helps configure AWS CLI for our deployment

Write-Host "🔧 AWS CLI Setup - System Architect" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version 2>$null
    if ($awsVersion) {
        Write-Host "✅ AWS CLI is installed: $awsVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ AWS CLI is not installed" -ForegroundColor Red
        Write-Host "Please install AWS CLI from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Please install AWS CLI from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking current AWS configuration..." -ForegroundColor Blue

# Check if AWS CLI is configured
try {
    $identity = aws sts get-caller-identity 2>$null
    if ($identity) {
        Write-Host "✅ AWS CLI is already configured" -ForegroundColor Green
        Write-Host "Current identity:" -ForegroundColor Blue
        Write-Host $identity -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "⚠️  AWS CLI is not configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Setting up AWS CLI configuration..." -ForegroundColor Blue
Write-Host ""
Write-Host "You'll need the following information:" -ForegroundColor Yellow
Write-Host "• AWS Access Key ID" -ForegroundColor White
Write-Host "• AWS Secret Access Key" -ForegroundColor White
Write-Host "• Default region (recommended: us-east-1)" -ForegroundColor White
Write-Host "• Default output format (recommended: json)" -ForegroundColor White
Write-Host ""

# Prompt for configuration
Write-Host "Press Enter to start AWS CLI configuration..." -ForegroundColor Blue
Read-Host

# Run AWS configure
Write-Host "🚀 Running 'aws configure'..." -ForegroundColor Blue
aws configure

Write-Host ""
Write-Host "🧪 Testing AWS CLI configuration..." -ForegroundColor Blue

# Test the configuration
try {
    $identity = aws sts get-caller-identity
    if ($identity) {
        Write-Host "✅ AWS CLI configuration successful!" -ForegroundColor Green
        Write-Host "Identity:" -ForegroundColor Blue
        Write-Host $identity -ForegroundColor White
        Write-Host ""
        
        # Test basic services
        Write-Host "🔍 Testing AWS services..." -ForegroundColor Blue
        
        # Test S3
        try {
            aws s3 ls >$null 2>&1
            Write-Host "✅ S3 access confirmed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  S3 access may be limited" -ForegroundColor Yellow
        }
        
        # Test EC2
        try {
            aws ec2 describe-regions --region us-east-1 >$null 2>&1
            Write-Host "✅ EC2 access confirmed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  EC2 access may be limited" -ForegroundColor Yellow
        }
        
        # Test Lambda
        try {
            aws lambda list-functions >$null 2>&1
            Write-Host "✅ Lambda access confirmed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Lambda access may be limited" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "🎉 AWS CLI setup complete!" -ForegroundColor Green
        Write-Host "Ready for System Architect deployment orchestration!" -ForegroundColor Blue
        
    } else {
        Write-Host "❌ AWS CLI configuration failed" -ForegroundColor Red
        Write-Host "Please check your credentials and try again" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ AWS CLI configuration test failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your credentials and try again" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host "1. Deploy infrastructure: .\aws-deployment\deploy.sh infrastructure" -ForegroundColor White
Write-Host "2. Set up SageMaker endpoint for Sealion LLM" -ForegroundColor White
Write-Host "3. Test CV service integration with co-worker" -ForegroundColor White
Write-Host "4. Deploy Lambda functions" -ForegroundColor White
Write-Host ""
Write-Host "System Architect is ready to orchestrate your AWS deployment! 🚀" -ForegroundColor Green
