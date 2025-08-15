#!/bin/bash

echo "🚀 Setting up SIMIS AI CV Environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

echo "✅ pip3 found: $(pip3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "cv_model/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv cv_model/venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source cv_model/venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
pip install -r cv_model/requirements.txt

# Check if model file exists
if [ ! -f "cv_model/models/poc1/weights/best.pt" ]; then
    echo "⚠️ Warning: Model file not found at cv_model/models/poc1/weights/best.pt"
    echo "Please ensure your YOLOv8 model is in the correct location."
else
    echo "✅ Model file found: cv_model/models/poc1/weights/best.pt"
fi

# Test the detection script
echo "🧪 Testing detection script..."
python cv_model/detect_screen.py --model cv_model/models/poc1/weights/best.pt --help

echo "🎉 CV environment setup complete!"
echo ""
echo "To activate the environment in the future, run:"
echo "source cv_model/venv/bin/activate"
echo ""
echo "To test the model, run:"
echo "python cv_model/detect_screen.py --model cv_model/models/poc1/weights/best.pt --image path/to/test/image.jpg"
echo ""
echo "To start the development server, run:"
echo "npm run dev"
