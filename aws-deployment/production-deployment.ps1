# Production Deployment Script for SIMISAI
# System Architect - Respects team's Astro + React + Express architecture

Write-Host "🏗️ System Architect: Production Deployment for SIMISAI" -ForegroundColor Green
Write-Host "Respecting team's Astro + React + Express architecture" -ForegroundColor Cyan

# Configuration
$ProjectRoot = "D:\Users\Cursor\SIMISAI"
$S3Bucket = "simisai-production-frontend"
$LambdaFunctionName = "simisai-production-backend"
$Region = "us-east-1"

# Step 1: Build the Astro frontend
Write-Host "`n📦 Step 1: Building Astro frontend..." -ForegroundColor Yellow
Set-Location $ProjectRoot

# Check if pnpm is available
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm found: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found. Installing..." -ForegroundColor Red
    npm install -g pnpm
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Build the application
Write-Host "Building Astro application..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Astro build completed!" -ForegroundColor Green

# Step 2: Deploy frontend to S3
Write-Host "`n🌐 Step 2: Deploying frontend to S3..." -ForegroundColor Yellow

# Upload all built files
Write-Host "Uploading built files to S3..." -ForegroundColor Yellow
aws s3 sync ./dist/public/ s3://$S3Bucket/ --delete --exclude "sealion_model/*"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ S3 upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend deployed to S3!" -ForegroundColor Green

# Step 3: Deploy backend to Lambda
Write-Host "`n⚡ Step 3: Deploying backend to Lambda..." -ForegroundColor Yellow

# Create Lambda deployment package
Write-Host "Creating Lambda deployment package..." -ForegroundColor Yellow
$LambdaDir = "lambda-deployment"
New-Item -ItemType Directory -Path $LambdaDir -Force

# Copy built server files
Copy-Item "./dist/index.js" "$LambdaDir/"
Copy-Item "./dist/server/" "$LambdaDir/server/" -Recurse -Force

# Copy shared files
Copy-Item "./shared/" "$LambdaDir/shared/" -Recurse -Force

# Copy package.json and install production dependencies
Copy-Item "./package.json" "$LambdaDir/"
Set-Location $LambdaDir
npm install --production

# Create deployment zip
Compress-Archive -Path "*.js", "server", "shared", "node_modules", "package.json" -DestinationPath "../lambda-deployment.zip" -Force
Set-Location $ProjectRoot

# Deploy to Lambda
Write-Host "Deploying to Lambda..." -ForegroundColor Yellow
aws lambda update-function-code --function-name $LambdaFunctionName --zip-file fileb://lambda-deployment.zip

if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating new Lambda function..." -ForegroundColor Yellow
    aws lambda create-function `
        --function-name $LambdaFunctionName `
        --runtime nodejs18.x `
        --role arn:aws:iam::710743745504:role/lambda-execution-role `
        --handler index.handler `
        --zip-file fileb://lambda-deployment.zip `
        --timeout 30 `
        --memory-size 1024 `
        --environment Variables='{
            "NODE_ENV": "production",
            "DATABASE_URL": "YOUR_DATABASE_URL_HERE",
            "SEALION_API_KEY": "YOUR_SEALION_API_KEY_HERE",
            "SEALION_API_URL": "YOUR_SEALION_API_URL_HERE",
            "CV_MODEL_PATH": "YOUR_CV_MODEL_PATH_HERE"
        }'
}

Write-Host "✅ Backend deployed to Lambda!" -ForegroundColor Green

# Step 4: Configure API Gateway
Write-Host "`n🔗 Step 4: Configuring API Gateway..." -ForegroundColor Yellow

# Create API Gateway if it doesn't exist
$ApiGatewayId = aws apigateway get-rest-apis --query 'items[?name==`simisai-api`].id' --output text

if (-not $ApiGatewayId) {
    Write-Host "Creating API Gateway..." -ForegroundColor Yellow
    $ApiGatewayId = aws apigateway create-rest-api --name simisai-api --description "SIMISAI Production API" --query 'id' --output text
}

# Create Lambda integration
Write-Host "Creating Lambda integration..." -ForegroundColor Yellow
aws apigateway put-integration `
    --rest-api-id $ApiGatewayId `
    --resource-id (aws apigateway get-resources --rest-api-id $ApiGatewayId --query 'items[?path==`/`].id' --output text) `
    --http-method ANY `
    --type AWS_PROXY `
    --integration-http-method POST `
    --uri "arn:aws:apigateway:$Region`:lambda:path/2015-03-31/functions/arn:aws:lambda:$Region`:710743745504:function:$LambdaFunctionName/invocations"

# Deploy API
Write-Host "Deploying API..." -ForegroundColor Yellow
aws apigateway create-deployment --rest-api-id $ApiGatewayId --stage-name prod

Write-Host "✅ API Gateway configured!" -ForegroundColor Green

# Step 5: Create CloudFront distribution
Write-Host "`n☁️ Step 5: Creating CloudFront distribution..." -ForegroundColor Yellow

$CloudFrontConfig = @{
    CallerReference = "simisai-production-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Origins = @{
        Quantity = 1
        Items = @(
            @{
                Id = "S3-simisai-production-frontend"
                DomainName = "$S3Bucket.s3-website-$Region.amazonaws.com"
                CustomOriginConfig = @{
                    HTTPPort = 80
                    HTTPSPort = 443
                    OriginProtocolPolicy = "http-only"
                }
            }
        )
    }
    DefaultCacheBehavior = @{
        TargetOriginId = "S3-simisai-production-frontend"
        ViewerProtocolPolicy = "redirect-to-https"
        TrustedSigners = @{
            Enabled = $false
            Quantity = 0
        }
        ForwardedValues = @{
            QueryString = $false
            Cookies = @{
                Forward = "none"
            }
        }
        MinTTL = 0
        DefaultTTL = 3600
        MaxTTL = 86400
    }
    Enabled = $true
    Comment = "SIMISAI Production Frontend"
} | ConvertTo-Json -Depth 10

$CloudFrontConfig | Out-File -FilePath "cloudfront-config.json" -Encoding UTF8
$DistributionId = aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --query 'Distribution.Id' --output text

Write-Host "✅ CloudFront distribution created: $DistributionId" -ForegroundColor Green

# Step 6: Summary
Write-Host "`n🎉 Production Deployment Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Frontend URL: https://$DistributionId.cloudfront.net" -ForegroundColor Cyan
Write-Host "API URL: https://$ApiGatewayId.execute-api.$Region.amazonaws.com/prod" -ForegroundColor Cyan
Write-Host "S3 Bucket: s3://$S3Bucket" -ForegroundColor Cyan
Write-Host "Lambda Function: $LambdaFunctionName" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Green

# Cleanup
Remove-Item -Path "lambda-deployment.zip" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "cloudfront-config.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "lambda-deployment" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`n🚀 SIMISAI is now live in production!" -ForegroundColor Green
