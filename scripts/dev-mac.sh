#!/bin/bash

# macOS Development Startup Script for SIMISAI
# This script sets up the development environment for localhost development on macOS

echo "🚀 Starting SIMISAI Development Environment for macOS..."

# Set environment variables for macOS localhost development
export NODE_ENV=development
export PORT=3001
export VITE_DEV_SERVER_HOST=localhost
export VITE_DEV_SERVER_PORT=3000

# Check if ports are available
echo "🔍 Checking port availability..."

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is already in use. Please stop the service using that port."
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use. Please stop the service using that port."
    exit 1
fi

echo "✅ Ports 3001 and 3000 are available"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting development server on localhost:3001..."
echo "📱 Starting Vite dev server on localhost:3000..."

# Start both servers in parallel
npm run dev:full

echo "🎉 Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "💬 WebSocket: ws://localhost:3001/chat-ws"
echo ""
echo "Press Ctrl+C to stop all servers"
