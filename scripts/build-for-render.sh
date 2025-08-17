#!/bin/bash

# Build Script for Render Deployment
echo "🚀 Building SIMIS AI for Render Deployment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Python dependencies for CV model
echo "🐍 Installing Python dependencies..."
cd cv_model
pip install -r requirements.txt
cd ..

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Build the backend
echo "🏗️ Building backend..."
npm run build:render

# Verify the build
echo "✅ Verifying build..."
if [ ! -d "dist/public" ]; then
    echo "❌ Frontend build failed - dist/public not found"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo "❌ Backend build failed - dist not found"
    exit 1
fi

if [ ! -f "cv_model/models/poc2/best.pt" ]; then
    echo "❌ CV model not found - cv_model/models/poc2/best.pt not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo ""
echo "📁 Build artifacts:"
echo "   - Frontend: dist/public/"
echo "   - Backend: dist/"
echo "   - CV Model: cv_model/models/poc2/best.pt"
echo ""
echo "🌐 Ready for Render deployment!"
