#!/bin/bash

# SIMISAI Docker Deployment Script
set -e

echo "🐳 Building SIMISAI Docker Image..."

# Build the Docker image
docker build -t simisai:latest .

echo "✅ Docker image built successfully!"

echo "🧪 Testing Docker container locally..."

# Test the container locally
docker run -d --name simisai-test -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CV_MODEL_PATH=cv_model/models/poc2/best.pt \
  simisai:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health endpoint
echo "🏥 Testing health endpoint..."
if curl -f http://localhost:3001/api/cv/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs simisai-test
    docker stop simisai-test
    docker rm simisai-test
    exit 1
fi

# Stop and remove test container
docker stop simisai-test
docker rm simisai-test

echo "🎉 Local test successful!"

echo ""
echo "📋 Deployment Options:"
echo "1. Deploy to Render using render-docker.yaml"
echo "2. Deploy to other platforms (AWS, GCP, etc.)"
echo "3. Run locally with docker-compose"
echo ""
echo "🚀 To deploy to Render:"
echo "   - Push this code to GitHub"
echo "   - Connect your repo to Render"
echo "   - Use render-docker.yaml as the blueprint"
echo ""
echo "🔧 To run locally:"
echo "   docker-compose up"
echo ""
echo "📦 Docker image ready: simisai:latest"
