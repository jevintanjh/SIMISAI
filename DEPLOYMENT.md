# SIMIS AI Deployment Guide

This guide explains how to deploy SIMIS AI using a **microservice architecture** where the frontend and CV model are deployed separately and communicate via REST APIs.

## Architecture Overview

### Current Setup (Monolithic)
```
┌─────────────────────────────────────┐
│           Single Server             │
│  ┌─────────────┐  ┌──────────────┐  │
│  │   Frontend  │  │  CV Model    │  │
│  │   (React)   │  │  (Python)    │  │
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

### Target Setup (Microservices)
```
┌─────────────────┐    REST API    ┌─────────────────┐
│   Frontend      │ ──────────────▶ │   CV Model      │
│   (Vercel)      │                │   (HF Spaces)   │
└─────────────────┘                └─────────────────┘
```

## Step 1: Deploy CV Model to Hugging Face Spaces

### 1.1 Prepare Your Model

1. **Navigate to cv_model directory:**
   ```bash
   cd cv_model
   ```

2. **Run the upload script:**
   ```bash
   python upload_to_huggingface.py
   ```
   - Enter your Hugging Face username when prompted
   - This will create a private repository with your model

3. **Create a Hugging Face Space:**
   - Go to [Hugging Face Spaces](https://huggingface.co/spaces)
   - Click "Create new Space"
   - Choose "Gradio" as the SDK
   - Set visibility to "Private" (recommended)
   - Name it something like `simisai-cv-model`

### 1.2 Upload Files to the Space

Upload these files to your Hugging Face Space:

1. **`app.py`** - The Gradio interface
2. **`requirements.txt`** - Python dependencies
3. **`best.pt`** - Your trained model
4. **`README.md`** - Model documentation

### 1.3 Get Your Space URL

After deployment, your Space will be available at:
```
https://your-username-simisai-cv-model.hf.space
```

## Step 2: Update Environment Variables

### 2.1 Local Development

Create a `.env` file in your project root:

```env
# For local development (uses local Python model)
# HF_SPACES_URL=

# For production (uses Hugging Face Spaces)
HF_SPACES_URL=https://your-username-simisai-cv-model.hf.space
```

### 2.2 Production Deployment

Set the environment variable in your hosting platform:

```env
HF_SPACES_URL=https://your-username-simisai-cv-model.hf.space
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare for Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Test the build locally:**
   ```bash
   npm start
   ```

### 3.2 Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add the environment variable:
     ```
     HF_SPACES_URL=https://your-username-simisai-cv-model.hf.space
     ```

## Step 4: Alternative Deployment Options

### Option A: Railway (Full-Stack)

Railway supports both Node.js and Python, so you can deploy everything together:

1. **Connect your GitHub repository to Railway**
2. **Set environment variables:**
   ```env
   HF_SPACES_URL=https://your-username-simisai-cv-model.hf.space
   ```
3. **Deploy automatically**

### Option B: Render (Full-Stack)

Similar to Railway:

1. **Connect your GitHub repository to Render**
2. **Set environment variables**
3. **Deploy automatically**

### Option C: DigitalOcean App Platform

1. **Create a new app in DigitalOcean**
2. **Connect your GitHub repository**
3. **Set environment variables**
4. **Deploy**

## Step 5: Testing the Deployment

### 5.1 Test the CV Model API

```bash
curl -X POST https://your-username-simisai-cv-model.hf.space/predict \
  -H "Content-Type: application/json" \
  -d '{"data": ["base64_image_data_here"]}'
```

### 5.2 Test the Frontend

1. **Visit your Vercel URL**
2. **Navigate to the guidance page**
3. **Test camera detection**

## Step 6: Monitoring and Maintenance

### 6.1 Hugging Face Spaces Monitoring

- **Logs**: Check Space logs for errors
- **Performance**: Monitor API response times
- **Usage**: Track API calls and usage

### 6.2 Vercel Monitoring

- **Analytics**: View page views and performance
- **Functions**: Monitor API function calls
- **Errors**: Check for frontend errors

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure your Hugging Face Space allows cross-origin requests
   - Add CORS headers if needed

2. **API Timeout:**
   - Hugging Face Spaces have timeout limits
   - Consider optimizing your model or using a different hosting solution

3. **Environment Variables:**
   - Double-check that `HF_SPACES_URL` is set correctly
   - Ensure the URL is accessible

4. **Model Loading:**
   - Check that your model file is properly uploaded
   - Verify the model path in `app.py`

### Performance Optimization

1. **Model Optimization:**
   - Consider quantizing your model for faster inference
   - Use smaller model variants if possible

2. **Caching:**
   - Implement client-side caching for repeated requests
   - Consider server-side caching for common detections

3. **CDN:**
   - Use a CDN for static assets
   - Consider edge caching for API responses

## Cost Considerations

### Hugging Face Spaces
- **Free tier**: Limited compute hours
- **Pro tier**: More compute hours and better performance
- **Enterprise**: Custom pricing

### Vercel
- **Free tier**: Good for development and small projects
- **Pro tier**: Better performance and more features
- **Enterprise**: Custom pricing

## Security Considerations

1. **API Keys:**
   - Keep your Hugging Face token secure
   - Use environment variables for sensitive data

2. **CORS:**
   - Configure CORS properly for production
   - Only allow necessary origins

3. **Rate Limiting:**
   - Implement rate limiting on your API
   - Monitor for abuse

4. **Data Privacy:**
   - Ensure image data is handled securely
   - Consider data retention policies

## Next Steps

1. **Set up monitoring and alerting**
2. **Implement error handling and retry logic**
3. **Add authentication if needed**
4. **Optimize performance based on usage patterns**
5. **Scale based on demand**

This microservice architecture allows you to:
- Deploy frontend and backend independently
- Scale each service based on demand
- Use specialized hosting for each component
- Maintain and update services separately
