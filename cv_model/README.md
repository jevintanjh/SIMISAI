# SIMIS - Oral Thermometer Detection Model

This is a YOLOv8 model trained to detect oral thermometers and their various states for the SIMIS application.

## Model Details

- **Model Type**: YOLOv8 (transfer learned)
- **Task**: Object Detection
- **Classes**: 9 different thermometer states and positions
- **Training Data**: Custom dataset of oral thermometers in various states
- **Model Size**: ~84MB

## Classes Detected

1. **thermometer (Lo error)** - Thermometer showing low error state
2. **thermometer (measuring)** - Thermometer actively measuring temperature
3. **thermometer (no display found)** - Thermometer with no readable display
4. **thermometer (off)** - Thermometer in off state
5. **thermometer button** - Thermometer control buttons
6. **thermometer in ear** - Thermometer positioned in ear
7. **thermometer in mouth** - Thermometer positioned in mouth
8. **thermometer in nose** - Thermometer positioned in nose
9. **thermometer on face** - Thermometer positioned on face

## Usage

This model can be used with the Hugging Face Transformers library or directly with YOLOv8.

### Using with Transformers

```python
from transformers import AutoImageProcessor, AutoModelForObjectDetection

processor = AutoImageProcessor.from_pretrained("your-username/simisai1.0")
model = AutoModelForObjectDetection.from_pretrained("your-username/simisai1.0")
```

### Using with YOLOv8

```python
from ultralytics import YOLO

model = YOLO("your-username/simisai1.0")
results = model("path/to/image.jpg")
```

## Model Performance

- **mAP@0.5**: [Add your metrics here]
- **Precision**: [Add your metrics here]
- **Recall**: [Add your metrics here]

## License

[Add your license information]
