# SIMIS AI Thermometer Detection Model

Custom YOLOv8 model trained specifically for thermometer detection in medical devices.

## Model Details

- **Architecture**: YOLOv8
- **Classes**: 9 thermometer types
- **Training Data**: Custom dataset of medical thermometers
- **Model File**: `best.pt`

## Classes

1. thermometer (Lo error)
2. thermometer (measuring)
3. thermometer (no display found)
4. thermometer (off)
5. thermometer button
6. thermometer in ear
7. thermometer in mouth
8. thermometer in nose
9. thermometer on face

## Usage

```python
import replicate

# Run inference
output = replicate.run(
    "your-username/simisai-thermometer-detection:latest",
    input={"image": "path/to/image.jpg", "confidence": 0.5}
)
```

## API Response Format

```json
[
  {
    "class": "thermometer (measuring)",
    "confidence": 0.95,
    "box": [100, 150, 300, 400]
  }
]
```
