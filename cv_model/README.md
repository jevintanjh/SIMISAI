# SIMIS AI Thermometer Detection Model

This is a YOLOv8 model trained to detect thermometers and their various states for the SIMIS AI medical device assistance application.

## Model Information

- **Model Type**: YOLOv8 Object Detection
- **Classes Detected**:
  - `thermometer (Lo error)` - Thermometer showing low battery error
  - `thermometer (measuring)` - Thermometer actively measuring temperature
  - `thermometer (no display found)` - Thermometer with no visible display
  - `thermometer (off)` - Thermometer in off state
  - `thermometer button` - Thermometer control button
  - `thermometer in ear` - Thermometer positioned in ear
  - `thermometer in mouth` - Thermometer positioned in mouth
  - `thermometer in nose` - Thermometer positioned in nose
  - `thermometer on face` - Thermometer positioned on face

## Usage

### Via Hugging Face Spaces API

The model is deployed as a REST API endpoint. You can call it with base64-encoded image data:

```python
import requests
import base64

# Encode your image
with open("image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

# Call the API
response = requests.post(
    "https://your-username-simisai1-0.hf.space/predict",
    json={"data": [image_data]}
)

result = response.json()
print(result)
```

### Via JavaScript/Frontend

```javascript
// Convert image to base64
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = image.width;
canvas.height = image.height;
ctx.drawImage(image, 0, 0);
const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];

// Call the API
const response = await fetch('https://your-username-simisai1-0.hf.space/predict', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        data: [base64Data]
    })
});

const result = await response.json();
console.log(result);
```

## API Response Format

The API returns results in the following format:

```json
{
    "detections": [
        {
            "class": "thermometer (measuring)",
            "confidence": 0.95,
            "bbox": [100, 150, 200, 300],
            "class_id": 1
        }
    ],
    "processing_time": 1500,
    "image_size": [640, 480]
}
```

## Model Performance

- **Training Data**: Custom dataset of thermometer images
- **Validation Accuracy**: [To be added]
- **Inference Speed**: ~1.5 seconds per image
- **Model Size**: 84MB

## License

This model is part of the SIMIS AI project and is intended for medical device assistance applications.

## Support

For questions or issues, please refer to the main SIMIS AI repository.
