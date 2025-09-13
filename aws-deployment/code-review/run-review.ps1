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
