# System Architect Review System Setup for Windows
# Simple PowerShell script to set up the review system

Write-Host "🔧 Setting up System Architect Review System for Windows" -ForegroundColor Blue
Write-Host "========================================================" -ForegroundColor Blue

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Not in a git repository. Initializing git..." -ForegroundColor Yellow
    git init
}

# Create .git/hooks directory if it doesn't exist
if (-not (Test-Path ".git/hooks")) {
    New-Item -ItemType Directory -Path ".git/hooks" -Force
}

# Create pre-commit hook
Write-Host "📝 Creating pre-commit hook..." -ForegroundColor Blue
$preCommitContent = @"
#!/bin/bash
echo "🔍 System Architect Pre-Commit Review"
echo "====================================="
if [ -f "aws-deployment/code-review/system-architect-review.sh" ]; then
    ./aws-deployment/code-review/system-architect-review.sh
    if [ `$? -eq 0 ]; then
        echo "✅ System Architect Review Passed"
        exit 0
    else
        echo "❌ System Architect Review Failed"
        exit 1
    fi
else
    echo "⚠️  Review script not found"
    exit 0
fi
"@

$preCommitContent | Out-File -FilePath ".git/hooks/pre-commit" -Encoding UTF8

# Create .gitignore for aws-deployment
Write-Host "📝 Creating .gitignore for aws-deployment..." -ForegroundColor Blue
if (-not (Test-Path "aws-deployment/.gitignore")) {
    $gitignoreContent = @"
# AWS Deployment
.env
*.env
.env.local
.env.production
.env.staging

# Lambda packages
lambda/*/node_modules/
lambda/*/package-lock.json
lambda/*/dist/
lambda/*/build/

# Python
lambda/*/__pycache__/
lambda/*/*.pyc
lambda/*/venv/
lambda/*/.venv/

# CloudFormation
infrastructure/*.template
infrastructure/parameters.json

# Deployment artifacts
deploy-artifacts/
*.zip
*.tar.gz

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
"@
    $gitignoreContent | Out-File -FilePath "aws-deployment/.gitignore" -Encoding UTF8
}

# Create reports directory
if (-not (Test-Path "aws-deployment/code-review/reports")) {
    New-Item -ItemType Directory -Path "aws-deployment/code-review/reports" -Force
}

# Create Windows batch file for review
Write-Host "📝 Creating Windows batch file for review..." -ForegroundColor Blue
$batchContent = @"
@echo off
echo 🔍 System Architect Review for Windows
echo =====================================

if not exist "aws-deployment\code-review\system-architect-review.sh" (
    echo ❌ Review script not found. Please run from project root.
    pause
    exit /b 1
)

echo 🚀 Running System Architect Review...
bash aws-deployment/code-review/system-architect-review.sh

if %errorlevel% equ 0 (
    echo.
    echo ✅ Review completed successfully!
) else (
    echo.
    echo ❌ Review failed. Please check the output above.
)

echo.
pause
"@
$batchContent | Out-File -FilePath "aws-deployment/code-review/run-review.bat" -Encoding ASCII

# Test the setup
Write-Host "🧪 Testing the setup..." -ForegroundColor Blue
if (Test-Path "aws-deployment/code-review/system-architect-review.sh") {
    Write-Host "✅ System Architect review script found" -ForegroundColor Green
} else {
    Write-Host "⚠️  System Architect review script not found" -ForegroundColor Yellow
}

# Display setup summary
Write-Host ""
Write-Host "🎉 System Architect Review System Setup Complete!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was set up:" -ForegroundColor Blue
Write-Host "  ✅ Pre-commit hook for code review" -ForegroundColor Green
Write-Host "  ✅ .gitignore for aws-deployment" -ForegroundColor Green
Write-Host "  ✅ Reports directory" -ForegroundColor Green
Write-Host "  ✅ Windows batch file (run-review.bat)" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 How to use:" -ForegroundColor Blue
Write-Host "  • Double-click run-review.bat for quick review" -ForegroundColor Yellow
Write-Host "  • Use Git Bash: ./aws-deployment/code-review/system-architect-review.sh" -ForegroundColor Yellow
Write-Host "  • Commits will automatically trigger review" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Blue
Write-Host "  1. Install Git for Windows if not already installed" -ForegroundColor Yellow
Write-Host "  2. Test the review system with: .\aws-deployment\code-review\run-review.bat" -ForegroundColor Yellow
Write-Host "  3. Make a test commit to verify hooks work" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
