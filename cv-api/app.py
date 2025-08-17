import base64
import io
import os
import time
from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
from ultralytics import YOLO


app = FastAPI(title="SIMISAI CV API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
model = YOLO(MODEL_PATH)


class DetectRequest(BaseModel):
    imageData: str


def decode_image(b64: str) -> Image.Image:
    cleaned = b64.split(",", 1)[-1]
    data = base64.b64decode(cleaned, validate=False)
    return Image.open(io.BytesIO(data)).convert("RGB")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"healthy": True, "model_path": MODEL_PATH, "timestamp": time.time()}


@app.post("/detect")
def detect(req: DetectRequest) -> Dict[str, Any]:
    start = time.time()
    img = decode_image(req.imageData)
    w, h = img.size

    results = model.predict(source=np.array(img), conf=0.5, verbose=False, device="cpu")

    detections: List[Dict[str, Any]] = []
    if results and len(results) > 0:
        r = results[0]
        if r.boxes is not None:
            names = r.names if hasattr(r, "names") else {}
            xyxy = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)
            for i in range(xyxy.shape[0]):
                x1, y1, x2, y2 = xyxy[i].tolist()
                detections.append({
                    "class": names.get(int(clss[i]), str(int(clss[i]))),
                    "confidence": float(confs[i]),
                    "bbox": [float(x1), float(y1), float(max(0.0, x2-x1)), float(max(0.0, y2-y1))],
                    "class_id": int(clss[i]),
                })

    return {
        "detections": detections,
        "processing_time": int((time.time() - start) * 1000),
        "image_size": [w, h],
    }


