import gradio as gr
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import io
from PIL import Image
import json
import time

# Load the model
model = YOLO("best.pt")

def predict_image(image_data):
    """
    Predict objects in the image
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
                    # Get coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    x, y, w, h = x1, y1, x2 - x1, y2 - y1
                    
                    # Get class and confidence
                    cls = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    
                    # Get class name
                    class_name = model.names[cls]
                    
                    detections.append({
                        "class": class_name,
                        "confidence": conf,
                        "bbox": [float(x), float(y), float(w), float(h)],
                        "class_id": cls
                    })
        
        # Return results in the same format as your local API
        return {
            "detections": detections,
            "processing_time": int(processing_time * 1000),  # Convert to milliseconds
            "image_size": [image_array.shape[1], image_array.shape[0]]  # [width, height]
        }
        
    except Exception as e:
        return {
            "error": str(e),
            "detections": [],
            "processing_time": 0,
            "image_size": [0, 0]
        }

def predict_api(image_data):
    """
    API endpoint for predictions
    """
    result = predict_image(image_data)
    return result

# Create Gradio interface with explicit API configuration
iface = gr.Interface(
    fn=predict_api,
    inputs=[
        gr.Textbox(label="Base64 Image Data", placeholder="Paste base64 image data here...")
    ],
    outputs=[
        gr.JSON(label="Detection Results")
    ],
    title="SIMIS AI Thermometer Detection",
    description="Upload an image or paste base64 data to detect thermometers and their states.",
    examples=[
        ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."]  # Add example base64 data
    ],
    # Enable API for Hugging Face Spaces
    api_name="predict",
    # Additional API configuration
    allow_flagging="never"
)

# For Hugging Face Spaces, we need to expose the function
predict = predict_api

# Launch the app
if __name__ == "__main__":
    iface.launch()
