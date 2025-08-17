# Replicate Setup Guide for SIMIS AI

## 🚀 Why Replicate?

Replicate is **much better** than Hugging Face for YOLOv8 models because:
- ✅ **No queue limitations** - Direct API access
- ✅ **Fast inference** - Optimized for ML models
- ✅ **Reliable** - Production-ready infrastructure
- ✅ **Simple setup** - Just need an API token
- ✅ **Free tier** - 500 predictions/month free

## 📋 Setup Steps

### 1. Get Replicate API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up for a free account
3. Go to your [Account Settings](https://replicate.com/account/api-tokens)
4. Create a new API token
5. Copy the token

### 2. Configure Your App

Add your Replicate API token to `.env`:

```env
# Replicate Configuration
REPLICATE_API_TOKEN=r8_your_token_here
REPLICATE_MODEL_VERSION=ultralytics/yolov8:6beff3369e81422112d93b89ca01400208eef704a8f2c83d2f11a7f6f52495b5
```

### 3. Test the Setup

1. Restart your server: `npm run dev`
2. Check health: `curl http://localhost:3001/api/cv/health`
3. You should see `"REPLICATE_API_TOKEN": "SET"`

## 🔧 How It Works

### Service Selection Logic

The app automatically chooses the best service:

```typescript
// Priority order:
1. Replicate (if REPLICATE_API_TOKEN is set)
2. Local model (fallback)
```

### Model Configuration

- **Model**: YOLOv8 (latest version)
- **Input**: Base64 images
- **Output**: JSON with detections
- **Classes**: 9 thermometer classes

## 💰 Pricing

- **Free tier**: 500 predictions/month
- **Paid**: $0.0001 per second of compute
- **YOLOv8**: ~2-3 seconds per prediction

## 🚨 Troubleshooting

### Common Issues

1. **"REPLICATE_API_TOKEN not configured"**
   - Check your `.env` file
   - Make sure token is valid

2. **"Prediction timeout"**
   - Model is loading (first time)
   - Wait 30-60 seconds

3. **"No results from Replicate API"**
   - Check your image format
   - Ensure base64 is valid

### Debug Commands

```bash
# Check health
curl http://localhost:3001/api/cv/health

# Test detection
curl -X POST http://localhost:3001/api/cv/detect \
  -H "Content-Type: application/json" \
  -d '{"imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}'
```

## 🎯 Benefits Over Hugging Face

| Feature | Hugging Face | Replicate |
|---------|-------------|-----------|
| API Access | Queue limited | Direct access |
| Speed | Slow (queues) | Fast |
| Reliability | Unreliable | Production-ready |
| Setup | Complex | Simple |
| Free Tier | Limited | 500 predictions |

## 📞 Support

- [Replicate Docs](https://replicate.com/docs)
- [YOLOv8 Model](https://replicate.com/ultralytics/yolov8)
- [API Reference](https://replicate.com/docs/reference/http)

---

**Your app is now ready to use Replicate!** 🎉
