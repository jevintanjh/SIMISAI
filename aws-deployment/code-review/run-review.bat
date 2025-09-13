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
