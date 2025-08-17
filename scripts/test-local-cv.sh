#!/bin/bash

# Test Local CV Model Setup for SIMIS AI
echo "🧪 Testing Local CV Model Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if local model exists
MODEL_PATH="cv_model/models/poc2/best.pt"
if [ ! -f "$MODEL_PATH" ]; then
    echo "❌ Error: Local model not found at $MODEL_PATH"
    echo "Please ensure the YOLOv8 model is downloaded to the correct location"
    exit 1
fi

echo "✅ Local model found: $MODEL_PATH"

# Check if Python script exists
PYTHON_SCRIPT="cv_model/detect_screen.py"
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "❌ Error: Python detection script not found at $PYTHON_SCRIPT"
    exit 1
fi

echo "✅ Python detection script found: $PYTHON_SCRIPT"

# Check Python dependencies
echo "🔍 Checking Python dependencies..."
cd cv_model
if ! python -c "import ultralytics, cv2, numpy" 2>/dev/null; then
    echo "❌ Error: Required Python packages not installed"
    echo "Please install dependencies: pip install -r requirements.txt"
    exit 1
fi
cd ..

echo "✅ Python dependencies are installed"

# Test the model directly
echo "🧪 Testing model inference..."
cd cv_model

# Create a test image (simple colored rectangle)
python -c "
import cv2
import numpy as np

# Create a test image
img = np.zeros((480, 640, 3), dtype=np.uint8)
img[100:200, 100:300] = [255, 0, 0]  # Red rectangle

# Save test image
cv2.imwrite('test_image.jpg', img)
print('Test image created: test_image.jpg')
"

# Run detection on test image
echo "Running detection on test image..."
python detect_screen.py --model models/poc2/best.pt --image test_image.jpg --conf 0.5 --output json

# Clean up test image
rm -f test_image.jpg

cd ..

echo ""
echo "🎉 Local CV model setup test completed!"
echo ""
echo "To run the app with local model:"
echo "1. Make sure HF_SPACES_URL is NOT set in your environment"
echo "2. Start the server: npm run dev"
echo "3. The app will automatically use the local model"
echo ""
echo "To verify local model is being used, check the server logs for:"
echo "  'Using local model: /path/to/cv_model/models/poc2/best.pt'"
