#!/bin/bash
# Setup script for image finder API keys
# Run this with: source ./scripts/setup-api-keys.sh

echo "🔑 Setting up API keys for SimisAI Image Finder"
echo ""

# Prompt for each API key
read -p "Enter your Unsplash Client ID (Access Key): " unsplash_key
read -p "Enter your Pexels API Key (optional, press Enter to skip): " pexels_key
read -p "Enter your Pixabay API Key (optional, press Enter to skip): " pixabay_key

# Export the keys
if [ -n "$unsplash_key" ]; then
    export UNSPLASH_CLIENT_ID="$unsplash_key"
    echo "✅ Unsplash Client ID set"
fi

if [ -n "$pexels_key" ]; then
    export PEXELS_API_KEY="$pexels_key"
    echo "✅ Pexels API Key set"
fi

if [ -n "$pixabay_key" ]; then
    export PIXABAY_API_KEY="$pixabay_key"
    echo "✅ Pixabay API Key set"
fi

echo ""
echo "✅ API keys configured for this session!"
echo "   To make them permanent, add these lines to your ~/.bashrc:"
echo ""
[ -n "$unsplash_key" ] && echo "export UNSPLASH_CLIENT_ID=\"$unsplash_key\""
[ -n "$pexels_key" ] && echo "export PEXELS_API_KEY=\"$pexels_key\""
[ -n "$pixabay_key" ] && echo "export PIXABAY_API_KEY=\"$pixabay_key\""
