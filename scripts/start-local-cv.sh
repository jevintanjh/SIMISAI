#!/bin/bash

# Start SIMIS AI with Local CV Model
echo "🚀 Starting SIMIS AI with Local CV Model"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Ensure no Hugging Face environment variables are set
echo "🔧 Configuring environment for local CV model..."

# Unset any Hugging Face related environment variables
unset HF_SPACES_URL
unset HUGGINGFACE_TOKEN
unset HF_HUB_TOKEN

# Set local model path explicitly (optional, as it's the default)
export CV_MODEL_PATH="cv_model/models/poc2/best.pt"

echo "✅ Environment configured for local model"
echo "   - HF_SPACES_URL: unset"
echo "   - CV_MODEL_PATH: $CV_MODEL_PATH"

# Test the local model setup first
echo ""
echo "🧪 Testing local model setup..."
if ! ./scripts/test-local-cv.sh > /dev/null 2>&1; then
    echo "❌ Local model test failed. Please fix the setup first."
    exit 1
fi

echo "✅ Local model test passed"

# Install Node.js dependencies if needed
echo ""
echo "📦 Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "✅ Node.js dependencies already installed"
fi

# Start the development server
echo ""
echo "🌐 Starting development server..."
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:3001"
echo "   - CV Model: Local (cv_model/models/poc2/best.pt)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
