import replicate
import torch
from ultralytics import YOLO
import base64
import io
from PIL import Image
import numpy as np
import os

def predict(image, confidence=0.5):
    """
    Run YOLOv8 inference on the input image.
    
    Args:
        image: PIL Image or path to image
        confidence: Confidence threshold for detections
    
    Returns:
        List of detections with bounding boxes and class names
    """
    try:
        # Load the custom trained model
        model_path = "best.pt"
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file {model_path} not found")
        
        model = YOLO(model_path)
        
        # Run inference
        results = model(image, conf=confidence)
        
        # Process results
        detections = []
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence_score = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                
                detections.append({
                    "class": class_name,
                    "confidence": confidence_score,
                    "box": [x1, y1, x2, y2]
                })
        
        return detections
        
    except Exception as e:
        return {"error": str(e)}
