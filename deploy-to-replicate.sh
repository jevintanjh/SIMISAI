#!/bin/bash

echo "🚀 Deploying Custom YOLOv8 Model to Replicate..."

# Create replicate-model directory if it doesn't exist
mkdir -p replicate-model

# Copy the custom model
echo "📁 Copying custom model..."
cp cv_model/models/poc2/best.pt replicate-model/

# Check if model was copied successfully
if [ ! -f "replicate-model/best.pt" ]; then
    echo "❌ Error: Could not find best.pt model file"
    echo "Expected location: cv_model/models/poc2/best.pt"
    exit 1
fi

echo "✅ Model copied successfully"

# Install replicate CLI if not already installed
if ! command -v replicate &> /dev/null; then
    echo "📦 Installing Replicate CLI..."
    pip install replicate
fi

# Check if user is logged in to Replicate
if ! replicate auth whoami &> /dev/null; then
    echo "🔐 Please log in to Replicate:"
    echo "1. Go to https://replicate.com/account/api-tokens"
    echo "2. Create an API token"
    echo "3. Run: replicate auth login"
    echo ""
    read -p "Press Enter after you've logged in..."
fi

echo "📤 Creating Replicate model..."
echo "This will create a new model in your Replicate account."
echo ""

# Get model name from user
read -p "Enter model name (e.g., simisai-thermometer-detection): " MODEL_NAME

if [ -z "$MODEL_NAME" ]; then
    MODEL_NAME="simisai-thermometer-detection"
fi

echo "🎯 Creating model: $MODEL_NAME"

# Create the model
replicate models create \
    --name "$MODEL_NAME" \
    --description "Custom YOLOv8 model for thermometer detection in medical devices" \
    --visibility public

echo "📁 Uploading model files..."
cd replicate-model

# Create the model version
replicate models versions create \
    --name "$MODEL_NAME" \
    --file predict.py \
    --file requirements.txt \
    --file README.md \
    --file best.pt

echo "✅ Model deployed successfully!"
echo ""
echo "🎉 Your custom model is now available at:"
echo "https://replicate.com/$(replicate auth whoami)/$MODEL_NAME"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the new model URL"
echo "2. Test the model with your app"
echo ""
echo "Model URL for .env:"
echo "REPLICATE_MODEL_VERSION=$(replicate auth whoami)/$MODEL_NAME:latest"
