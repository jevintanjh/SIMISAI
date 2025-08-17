# Running SIMIS AI with Local CV Model

This guide explains how to run the SIMIS AI application using a local computer vision model instead of Hugging Face.

## Overview

The app is already configured to use local models by default. It will automatically use the local YOLOv8 model located at `cv_model/models/poc2/best.pt` unless Hugging Face environment variables are set.

## Quick Start

### Option 1: Use the provided script (Recommended)

```bash
# Make sure you're in the project root directory
cd /path/to/SIMISAI

# Run the local CV setup script
./scripts/start-local-cv.sh
```

This script will:
- Configure the environment for local model usage
- Test the local model setup
- Install dependencies if needed
- Start the development server

### Option 2: Manual setup

1. **Ensure no Hugging Face environment variables are set:**
   ```bash
   unset HF_SPACES_URL
   unset HUGGINGFACE_TOKEN
   unset HF_HUB_TOKEN
   ```

2. **Install Python dependencies:**
   ```bash
   cd cv_model
   pip install -r requirements.txt
   cd ..
   ```

3. **Test the local model:**
   ```bash
   ./scripts/test-local-cv.sh
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Verification

To verify that the local model is being used, check the server logs when starting the application. You should see:

```
Using local model: /path/to/cv_model/models/poc2/best.pt
```

## Model Information

- **Model Type**: YOLOv8
- **Model Location**: `cv_model/models/poc2/best.pt`
- **Classes**: 9 thermometer-related classes
- **Confidence Threshold**: 0.5 (configurable)

### Supported Classes

1. thermometer (Lo error)
2. thermometer (measuring)
3. thermometer (no display found)
4. thermometer (off)
5. thermometer button
6. thermometer in ear
7. thermometer in mouth
8. thermometer in nose
9. thermometer on face

## Configuration

### Environment Variables

- `CV_MODEL_PATH`: Path to the local model (defaults to `cv_model/models/poc2/best.pt`)
- `HF_SPACES_URL`: If set, will use Hugging Face instead of local model
- `HUGGINGFACE_TOKEN`: Hugging Face authentication token (not needed for local)

### Model Parameters

You can adjust the confidence threshold and other parameters in:
- `server/cv-service.ts` - Main CV service configuration
- `cv_model/detect_screen.py` - Python detection script

## Troubleshooting

### Common Issues

1. **"Required Python packages not installed"**
   ```bash
   cd cv_model
   pip install -r requirements.txt
   cd ..
   ```

2. **"Model file not found"**
   - Ensure the model file exists at `cv_model/models/poc2/best.pt`
   - Check file permissions

3. **"Python script not found"**
   - Ensure `cv_model/detect_screen.py` exists
   - Check file permissions

4. **Still using Hugging Face**
   - Check that `HF_SPACES_URL` is not set in your environment
   - Restart the server after unsetting environment variables

### Testing

Run the test script to verify everything is working:

```bash
./scripts/test-local-cv.sh
```

## Performance

- **Inference Speed**: Depends on your hardware (CPU/GPU)
- **Memory Usage**: ~200-500MB for the model
- **Accuracy**: Same as the Hugging Face version

## Switching Between Local and Hugging Face

To switch back to Hugging Face:

```bash
export HF_SPACES_URL="your-huggingface-spaces-url"
npm run dev
```

To switch back to local:

```bash
unset HF_SPACES_URL
npm run dev
```

## Development

The local CV model setup uses:
- **YOLOv8**: For object detection
- **OpenCV**: For image processing
- **Node.js child_process**: For Python script execution
- **Express.js**: For API endpoints

The detection pipeline:
1. Frontend captures camera frames
2. Frames are sent to `/api/cv/detect` endpoint
3. Server spawns Python process with YOLOv8
4. Results are returned to frontend
5. Bounding boxes are drawn on the video stream
