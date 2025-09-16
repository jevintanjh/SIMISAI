# System Architect Review System Setup for Windows
# PowerShell script to set up pre-commit hooks and review system

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
$preCommitHook = @'
#!/bin/bash

# System Architect Pre-Commit Review
# This hook runs before every commit to ensure code quality

echo "🔍 System Architect Pre-Commit Review"
echo "====================================="

# Check if we're in the aws-deployment directory
if [ -f "aws-deployment/code-review/system-architect-review.sh" ]; then
    # Run system architect review
    ./aws-deployment/code-review/system-architect-review.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ System Architect Review Passed"
        echo "🚀 Code is ready for commit"
        exit 0
    else
        echo ""
        echo "❌ System Architect Review Failed"
        echo "🔧 Please fix the issues above before committing"
        echo ""
        echo "To skip this check (not recommended):"
        echo "  git commit --no-verify -m \"Your commit message\""
        exit 1
    fi
else
    echo "⚠️  System Architect review script not found"
    echo "   Skipping review..."
    exit 0
fi
'@

$preCommitHook | Out-File -FilePath ".git/hooks/pre-commit" -Encoding UTF8

# Create pre-push hook
Write-Host "📝 Creating pre-push hook..." -ForegroundColor Blue
$prePushHook = @'
#!/bin/bash

# System Architect Pre-Push Review
# This hook runs before pushing to ensure deployment readiness

echo "🚀 System Architect Pre-Push Review"
echo "==================================="

# Check if we're pushing to main/master branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "🔍 Pushing to main branch - running comprehensive review..."
    
    if [ -f "aws-deployment/code-review/system-architect-review.sh" ]; then
        # Run comprehensive review
        ./aws-deployment/code-review/system-architect-review.sh
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ System Architect Review Passed"
            echo "🚀 Code is ready for deployment"
            exit 0
        else
            echo ""
            echo "❌ System Architect Review Failed"
            echo "🔧 Please fix the issues above before pushing to main"
            echo ""
            echo "To skip this check (not recommended):"
            echo "  git push --no-verify origin main"
            exit 1
        fi
    else
        echo "⚠️  System Architect review script not found"
        echo "   Skipping review..."
        exit 0
    fi
else
    echo "ℹ️  Pushing to feature branch - skipping comprehensive review"
    exit 0
fi
'@

$prePushHook | Out-File -FilePath ".git/hooks/pre-push" -Encoding UTF8

# Create commit-msg hook
Write-Host "📝 Creating commit-msg hook..." -ForegroundColor Blue
$commitMsgHook = @'
#!/bin/bash

# Conventional Commits Validation
# This hook validates commit message format

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Please use conventional commit format:"
    echo "  feat: add new feature"
    echo "  fix: fix bug"
    echo "  docs: update documentation"
    echo "  style: formatting changes"
    echo "  refactor: code refactoring"
    echo "  test: add tests"
    echo "  chore: maintenance tasks"
    echo "  perf: performance improvements"
    echo "  ci: CI/CD changes"
    echo "  build: build system changes"
    echo "  revert: revert previous commit"
    echo ""
    echo "Examples:"
    echo "  feat: add SageMaker integration"
    echo "  fix: resolve Lambda timeout issue"
    echo "  docs: update deployment guide"
    echo ""
    exit 1
fi

echo "✅ Commit message format is valid"
'@

$commitMsgHook | Out-File -FilePath ".git/hooks/commit-msg" -Encoding UTF8

# Create .gitignore for aws-deployment
Write-Host "📝 Creating .gitignore for aws-deployment..." -ForegroundColor Blue
if (-not (Test-Path "aws-deployment/.gitignore")) {
    $gitignoreContent = @'
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
'@
    $gitignoreContent | Out-File -FilePath "aws-deployment/.gitignore" -Encoding UTF8
}

# Create review configuration
Write-Host "📝 Creating review configuration..." -ForegroundColor Blue
if (-not (Test-Path "aws-deployment/code-review/review-config.json")) {
    $configContent = @'
{
  "review": {
    "enabled": true,
    "strict_mode": false,
    "auto_fix": false,
    "skip_patterns": [
      "*.md",
      "*.txt",
      "*.json",
      "*.yaml",
      "*.yml"
    ],
    "required_checks": [
      "aws_compatibility",
      "security",
      "performance",
      "integration"
    ],
    "optional_checks": [
      "code_quality",
      "documentation"
    ],
    "thresholds": {
      "min_success_rate": 80,
      "max_warnings": 5,
      "max_failures": 0
    }
  },
  "notifications": {
    "slack": {
      "enabled": false,
      "webhook_url": ""
    },
    "email": {
      "enabled": false,
      "recipients": []
    }
  },
  "reports": {
    "generate_html": true,
    "generate_json": true,
    "output_dir": "./reports"
  }
}
'@
    $configContent | Out-File -FilePath "aws-deployment/code-review/review-config.json" -Encoding UTF8
}

# Create reports directory
if (-not (Test-Path "aws-deployment/code-review/reports")) {
    New-Item -ItemType Directory -Path "aws-deployment/code-review/reports" -Force
}

# Create Windows batch file for review
Write-Host "📝 Creating Windows batch file for review..." -ForegroundColor Blue
$batchContent = @'
@echo off
REM System Architect Review for Windows
REM This batch file runs the review system on Windows

echo 🔍 System Architect Review for Windows
echo =====================================

REM Check if Git Bash is available
where bash >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git Bash not found. Please install Git for Windows.
    echo    Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "aws-deployment\code-review\system-architect-review.sh" (
    echo ❌ Review script not found. Please run from project root.
    pause
    exit /b 1
)

REM Run the review using Git Bash
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
echo Press any key to continue...
pause >nul
'@
$batchContent | Out-File -FilePath "aws-deployment/code-review/run-review.bat" -Encoding ASCII

# Create PowerShell script for review
Write-Host "📝 Creating PowerShell script for review..." -ForegroundColor Blue
$psContent = @'
# System Architect Review for Windows PowerShell
# This script runs the review system using PowerShell

Write-Host "🔍 System Architect Review for Windows PowerShell" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "aws-deployment/code-review/system-architect-review.sh")) {
    Write-Host "❌ Review script not found. Please run from project root." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Check if Git Bash is available
try {
    $null = Get-Command bash -ErrorAction Stop
    Write-Host "✅ Git Bash found" -ForegroundColor Green
} catch {
    Write-Host "❌ Git Bash not found. Please install Git for Windows." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Run the review
Write-Host "🚀 Running System Architect Review..." -ForegroundColor Blue
Write-Host ""

$result = bash aws-deployment/code-review/system-architect-review.sh

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Review completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Review failed. Please check the output above." -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to continue"
'@
$psContent | Out-File -FilePath "aws-deployment/code-review/run-review.ps1" -Encoding UTF8

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
Write-Host "  ✅ Pre-push hook for deployment readiness" -ForegroundColor Green
Write-Host "  ✅ Commit message validation" -ForegroundColor Green
Write-Host "  ✅ .gitignore for aws-deployment" -ForegroundColor Green
Write-Host "  ✅ Review configuration" -ForegroundColor Green
Write-Host "  ✅ Reports directory" -ForegroundColor Green
Write-Host "  ✅ Windows batch file (run-review.bat)" -ForegroundColor Green
Write-Host "  ✅ PowerShell script (run-review.ps1)" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 How to use:" -ForegroundColor Blue
Write-Host "  • Double-click run-review.bat for quick review" -ForegroundColor Yellow
Write-Host "  • Run .\aws-deployment\code-review\run-review.ps1 in PowerShell" -ForegroundColor Yellow
Write-Host "  • Use Git Bash: ./aws-deployment/code-review/system-architect-review.sh" -ForegroundColor Yellow
Write-Host "  • Commits will automatically trigger review" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Blue
Write-Host "  1. Install Git for Windows if not already installed" -ForegroundColor Yellow
Write-Host "  2. Test the review system with: .\aws-deployment\code-review\run-review.bat" -ForegroundColor Yellow
Write-Host "  3. Make a test commit to verify hooks work" -ForegroundColor Yellow
Write-Host "  4. Customize review configuration if needed" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more information, see:" -ForegroundColor Blue
Write-Host "  • aws-deployment\code-review\README.md" -ForegroundColor Yellow
Write-Host "  • aws-deployment\code-review\review-config.json" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
