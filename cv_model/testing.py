import cv2
import numpy as np
from ultralytics import YOLO
import mss

# === Configurations ===
model_path = 'models/poc3/best.pt'
model = YOLO(model_path)

# Define screen region (you can adjust this)
monitor_region = {"top": 100, "left": 100, "width": 1280, "height": 720}

# Setup screen capture
sct = mss.mss()

while True:
    # Capture screen region
    screenshot = sct.grab(monitor_region)
    
    # Convert to NumPy array
    frame = np.array(screenshot)
    frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)  # Remove alpha channel

    # Run YOLOv8 inference
    results = model(frame)[0]
    
    # Annotate frame with detections
    annotated = results.plot()

    # Display the result
    cv2.imshow("YOLOv8 Screen Detection", annotated)

    # Exit on 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()
