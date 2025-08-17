# Deploying SIMIS AI to Render

This guide explains how to deploy your SIMIS AI application to Render, including the frontend, backend, and local CV model.

## Overview

Render is a cloud platform that can host your entire application. We'll deploy:
- **Backend**: Node.js service with integrated CV model
- **Frontend**: Static React site
- **CV Model**: Local YOLOv8 model (84MB)

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repo
3. **Model File**: Ensure `cv_model/models/poc2/best.pt` is in your repo

## Deployment Strategy

### Option 1: Single Service (Recommended for Testing)

Deploy everything as one service:

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configure the service**:
   - **Build Command**: `./scripts/build-for-render.sh`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

### Option 2: Multi-Service (Production)

Deploy frontend and backend separately:

1. **Backend Service**: Node.js with CV model
2. **Frontend Service**: Static site

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify your repository structure**:
   ```
   SIMISAI/
   ├── client/                 # Frontend React app
   ├── server/                 # Backend Express app
   ├── cv_model/              # CV model and Python scripts
   │   ├── models/poc2/best.pt
   │   ├── detect_screen.py
   │   └── requirements.txt
   ├── package.json
   ├── render.yaml            # Render configuration
   └── scripts/
       └── build-for-render.sh
   ```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Go to Render Dashboard**
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect `render.yaml`**
5. **Click "Apply"**

#### Option B: Manual Setup

1. **Create Backend Service**:
   - **New +** → **Web Service**
   - **Connect GitHub repository**
   - **Name**: `simisai-backend`
   - **Environment**: Node.js
   - **Build Command**: `./scripts/build-for-render.sh`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

2. **Create Frontend Service**:
   - **New +** → **Static Site**
   - **Connect GitHub repository**
   - **Name**: `simisai-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `client/dist`

### Step 3: Configure Environment Variables

In your Render service settings, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
CV_MODEL_PATH=cv_model/models/poc2/best.pt
SESSION_SECRET=your_secure_session_secret_here
```

### Step 4: Update Frontend Configuration

Update your frontend to point to the backend service:

```bash
VITE_API_BASE_URL=https://your-backend-service.onrender.com
VITE_WS_BASE_URL=wss://your-backend-service.onrender.com
```

## Important Considerations

### 1. Model File Size

Your CV model is 84MB, which is large for deployment. Consider:

- **Git LFS**: Use Git Large File Storage for the model
- **External Storage**: Store model on AWS S3 or similar
- **Model Optimization**: Compress or quantize the model

### 2. Memory and CPU Limits

Render's free tier has limitations:
- **Memory**: 512MB RAM
- **CPU**: Limited processing power
- **Build Time**: 15 minutes max

For CV model inference, consider:
- **Upgrading to paid plan** ($7/month)
- **Optimizing model size**
- **Caching results**

### 3. Cold Starts

Render services sleep after inactivity:
- **First request**: 30-60 seconds to wake up
- **CV model loading**: Additional 10-20 seconds
- **Solution**: Use health checks or keep-alive

## Optimization Tips

### 1. Model Optimization

```python
# In cv_model/detect_screen.py
import torch

# Load model with optimizations
model = YOLO(model_path)
model.to('cpu')  # Force CPU usage on Render
```

### 2. Caching

```javascript
// In server/cv-service.ts
const cache = new Map();

async detectObjects(imagePath: string): Promise<CVResponse> {
  const cacheKey = createHash(imagePath);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await this.runInference(imagePath);
  cache.set(cacheKey, result);
  return result;
}
```

### 3. Health Checks

```javascript
// Add to server/routes.ts
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

## Troubleshooting

### Common Issues

1. **Build Timeout**:
   - Reduce model size
   - Use Git LFS for large files
   - Optimize dependencies

2. **Memory Issues**:
   - Upgrade to paid plan
   - Optimize model loading
   - Implement caching

3. **Cold Start Delays**:
   - Use health checks
   - Implement keep-alive
   - Consider serverless alternatives

### Debugging

1. **Check Render Logs**:
   - Go to your service dashboard
   - Click "Logs" tab
   - Look for build or runtime errors

2. **Test Locally**:
   ```bash
   ./scripts/build-for-render.sh
   npm start
   ```

3. **Verify Environment**:
   ```bash
   curl https://your-service.onrender.com/api/cv/health
   ```

## Cost Estimation

- **Free Tier**: $0/month (limited resources)
- **Starter Plan**: $7/month (recommended for CV model)
- **Standard Plan**: $25/month (better performance)

## Alternative Hosting Options

If Render doesn't meet your needs:

1. **Railway**: Similar to Render, good for full-stack apps
2. **Heroku**: More expensive but reliable
3. **DigitalOcean App Platform**: Good performance
4. **AWS/GCP**: More complex but scalable

## Next Steps

1. **Deploy to Render** using the guide above
2. **Test the deployment** thoroughly
3. **Monitor performance** and costs
4. **Optimize** based on usage patterns
5. **Scale** as needed

## Support

If you encounter issues:
1. Check Render's documentation
2. Review the troubleshooting section
3. Check your service logs
4. Consider upgrading your plan
