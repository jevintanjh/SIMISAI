#!/bin/bash

# Setup Pre-Commit Hooks for System Architect Review
# This script sets up automated code review before commits

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up System Architect Pre-Commit Hooks${NC}"
echo "=================================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Not in a git repository. Initializing git...${NC}"
    git init
fi

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
echo -e "${BLUE}📝 Creating pre-commit hook...${NC}"
cat > .git/hooks/pre-commit << 'EOF'
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
EOF

# Make pre-commit hook executable
chmod +x .git/hooks/pre-commit

# Create pre-push hook
echo -e "${BLUE}📝 Creating pre-push hook...${NC}"
cat > .git/hooks/pre-push << 'EOF'
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
EOF

# Make pre-push hook executable
chmod +x .git/hooks/pre-push

# Create commit-msg hook for conventional commits
echo -e "${BLUE}📝 Creating commit-msg hook...${NC}"
cat > .git/hooks/commit-msg << 'EOF'
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
EOF

# Make commit-msg hook executable
chmod +x .git/hooks/commit-msg

# Create .gitignore for aws-deployment if it doesn't exist
echo -e "${BLUE}📝 Creating .gitignore for aws-deployment...${NC}"
if [ ! -f "aws-deployment/.gitignore" ]; then
    cat > aws-deployment/.gitignore << 'EOF'
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
EOF
fi

# Create review configuration file
echo -e "${BLUE}📝 Creating review configuration...${NC}"
if [ ! -f "aws-deployment/code-review/review-config.json" ]; then
    cat > aws-deployment/code-review/review-config.json << 'EOF'
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
EOF
fi

# Create reports directory
mkdir -p aws-deployment/code-review/reports

# Test the setup
echo -e "${BLUE}🧪 Testing the setup...${NC}"
if [ -f "aws-deployment/code-review/system-architect-review.sh" ]; then
    chmod +x aws-deployment/code-review/system-architect-review.sh
    echo -e "${GREEN}✅ System Architect review script is executable${NC}"
else
    echo -e "${YELLOW}⚠️  System Architect review script not found${NC}"
fi

# Display setup summary
echo ""
echo -e "${GREEN}🎉 Pre-Commit Hooks Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📋 What was set up:"
echo "  ✅ Pre-commit hook for code review"
echo "  ✅ Pre-push hook for deployment readiness"
echo "  ✅ Commit message validation"
echo "  ✅ .gitignore for aws-deployment"
echo "  ✅ Review configuration"
echo "  ✅ Reports directory"
echo ""
echo "🔧 How it works:"
echo "  • Every commit triggers System Architect review"
echo "  • Pushes to main branch require comprehensive review"
echo "  • Commit messages must follow conventional format"
echo "  • Review results are logged and can generate reports"
echo ""
echo "🚀 Next steps:"
echo "  1. Make your first commit to test the hooks"
echo "  2. Review the generated reports"
echo "  3. Customize review configuration if needed"
echo "  4. Set up notifications (optional)"
echo ""
echo "📖 For more information, see:"
echo "  • aws-deployment/code-review/system-architect-review.md"
echo "  • aws-deployment/code-review/review-config.json"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
