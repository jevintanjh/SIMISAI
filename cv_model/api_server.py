#!/usr/bin/env python3
"""
Flask API server for YOLO thermometer detection
Designed to be deployed on AWS EC2
"""

import os
import json
import time
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Load the model
MODEL_PATH = os.environ.get('MODEL_PATH', '/app/models/poc2/best.pt')
model = None

def load_model():
    """Load the YOLO model"""
    global model
    try:
        print(f"Loading model from: {MODEL_PATH}")
        model = YOLO(MODEL_PATH)
        print("Model loaded successfully!")
        print(f"Model classes: {model.names}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

def predict_image(image_data):
    """
    Predict objects in the image using YOLO
    """
    try:
        # Decode base64 image
        if isinstance(image_data, str):
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]

            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            image = image_data

        # Convert to numpy array
        image_array = np.array(image)

        # Run inference
        start_time = time.time()
        results = model(image_array, conf=0.5)
        processing_time = time.time() - start_time

        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get coordinates (YOLO returns xyxy format)
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    x, y, w, h = float(x1), float(y1), float(x2 - x1), float(y2 - y1)

                    # Get class and confidence
                    cls = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())

                    # Get class name
                    class_name = model.names[cls]

                    detections.append({
                        "class": class_name,
                        "confidence": conf,
                        "bbox": [x, y, w, h],  # [x, y, width, height]
                        "class_id": cls
                    })

        # Return results in the expected format
        return {
            "detections": detections,
            "processing_time": int(processing_time * 1000),  # Convert to milliseconds
            "image_size": [image_array.shape[1], image_array.shape[0]]  # [width, height]
        }

    except Exception as e:
        print(f"Prediction error: {e}")
        return {
            "error": str(e),
            "detections": [],
            "processing_time": 0,
            "image_size": [0, 0]
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_classes": len(model.names) if model else 0
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Extract image data - try multiple field names for compatibility
        image_data = data.get('imageData') or data.get('image_data') or data.get('data', [None])[0]

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Run prediction
        result = predict_image(image_data)

        return jsonify(result)

    except Exception as e:
        print(f"API error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify({
        "model_path": MODEL_PATH,
        "model_type": "YOLOv8",
        "classes": list(model.names.values()),
        "num_classes": len(model.names)
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "SIMISAI CV API",
        "version": "1.0",
        "endpoints": ["/health", "/predict", "/info"],
        "status": "running"
    })

if __name__ == '__main__':
    print("Starting SIMISAI CV API Server...")

    # Load model on startup
    if not load_model():
        print("Failed to load model, exiting...")
        exit(1)

    # Start Flask server
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')

    print(f"Server starting on {host}:{port}")
    app.run(host=host, port=port, debug=False)