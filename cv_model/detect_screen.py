#!/usr/bin/env python3
"""
YOLOv8 Detection Script for SIMIS AI
Can be used for both screen capture and image file detection
"""

import cv2
import numpy as np
from ultralytics import YOLO
import mss
import argparse
import json
import sys
import os
from pathlib import Path

def detect_in_image(model_path, image_path, conf_threshold=0.5):
    """Detect objects in a single image file"""
    try:
        # Suppress warnings and set environment variables to avoid config directory issues
        import warnings
        import os
        warnings.filterwarnings("ignore")
        
        # Set YOLO config directory to avoid permission issues
        os.environ['YOLO_CONFIG_DIR'] = '/tmp'
        
        # Check if this is a Hugging Face model path
        if '/' in model_path and not os.path.exists(model_path):
            # It's a Hugging Face model, ensure we're authenticated
            token = os.getenv('HUGGINGFACE_TOKEN') or os.getenv('HF_HUB_TOKEN')
            if token:
                print(f"Using Hugging Face model: {model_path}")
            else:
                print(f"Warning: No Hugging Face token found for private model: {model_path}")
        
        # Load model
        model = YOLO(model_path)
        
        # Load image
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Run inference (suppress verbose output for API calls)
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            results = model(image_path, conf=conf_threshold, verbose=False)[0]
        
        # Extract detections
        detections = []
        if results.boxes is not None:
            for box in results.boxes:
                # Get box coordinates (x1, y1, x2, y2)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Convert to (x, y, width, height) format
                x, y, width, height = x1, y1, x2 - x1, y2 - y1
                
                detection = {
                    "class": results.names[int(box.cls[0])],
                    "confidence": float(box.conf[0]),
                    "bbox": [float(x), float(y), float(width), float(height)],
                    "class_id": int(box.cls[0])
                }
                detections.append(detection)
        
        # Get image dimensions
        img = cv2.imread(image_path)
        image_size = [img.shape[1], img.shape[0]]  # [width, height]
        
        return {
            "detections": detections,
            "image_size": image_size,
            "success": True
        }
        
    except Exception as e:
        return {
            "detections": [],
            "image_size": [0, 0],
            "success": False,
            "error": str(e)
        }

def detect_screen_realtime(model_path, monitor_region=None, conf_threshold=0.5):
    """Real-time screen detection (for future use)"""
    model = YOLO(model_path)
    sct = mss.mss()
    
    if monitor_region is None:
        monitor_region = {"top": 100, "left": 100, "width": 1280, "height": 720}
    
    while True:
        # Capture screen region
        screenshot = sct.grab(monitor_region)
        
        # Convert to NumPy array
        frame = np.array(screenshot)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
        
        # Run inference
        results = model(frame, conf=conf_threshold)[0]
        
        # Annotate frame
        annotated = results.plot()
        
        # Display result
        cv2.imshow("YOLOv8 Screen Detection", annotated)
        
        # Exit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cv2.destroyAllWindows()

def main():
    # Suppress all warnings to avoid interfering with JSON output
    import warnings
    warnings.filterwarnings("ignore")
    
    # Set YOLO config directory to avoid permission issues
    import os
    os.environ['YOLO_CONFIG_DIR'] = '/tmp'
    
    parser = argparse.ArgumentParser(description='YOLOv8 Detection for SIMIS AI')
    parser.add_argument('--model', required=True, help='Path to YOLOv8 model file')
    parser.add_argument('--image', help='Path to image file for detection')
    parser.add_argument('--screen', action='store_true', help='Run real-time screen detection')
    parser.add_argument('--conf', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--output', choices=['json', 'display'], default='json', 
                       help='Output format: json for API, display for visualization')
    
    args = parser.parse_args()
    
    # Validate model path (skip for Hugging Face models)
    if not os.path.exists(args.model) and not ('/' in args.model and not args.model.startswith('/')):
        print(json.dumps({
            "error": f"Model file not found: {args.model}",
            "success": False
        }))
        sys.exit(1)
    
    try:
        if args.image:
            # Image detection mode
            result = detect_in_image(args.model, args.image, args.conf)
            
            if args.output == 'json':
                print(json.dumps(result))
            else:
                # Display mode - show image with detections
                model = YOLO(args.model)
                results = model(args.image, conf=args.conf)[0]
                annotated = results.plot()
                cv2.imshow("Detection Results", annotated)
                cv2.waitKey(0)
                cv2.destroyAllWindows()
                
        elif args.screen:
            # Screen detection mode
            detect_screen_realtime(args.model, conf_threshold=args.conf)
            
        else:
            print(json.dumps({
                "error": "Please specify either --image or --screen",
                "success": False
            }))
            sys.exit(1)
            
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "success": False
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
