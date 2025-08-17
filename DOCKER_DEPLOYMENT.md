# SIMISAI Docker Deployment Guide

This guide explains how to deploy SIMISAI as a monolithic Docker application.

## 🐳 Overview

The application is containerized as a single Docker image containing:
- **Node.js backend** (Express server)
- **React frontend** (built and served statically)
- **Python CV model** (YOLOv8 for thermometer detection)
- **All dependencies** in one container

## 📁 Files Created

- `Dockerfile` - Main container definition
- `.dockerignore` - Files to exclude from build
- `docker-compose.yml` - Local development setup
- `render-docker.yaml` - Render deployment configuration
- `scripts/deploy-docker.sh` - Deployment automation script

## 🚀 Quick Start

### Local Testing

1. **Build and test locally:**
   ```bash
   ./scripts/deploy-docker.sh
   ```

2. **Or use docker-compose:**
   ```bash
   docker-compose up
   ```

3. **Access the application:**
   - Frontend: http://localhost:3001
   - API: http://localhost:3001/api
   - Health check: http://localhost:3001/api/cv/health

### Manual Docker Commands

```bash
# Build the image
docker build -t simisai:latest .

# Run locally
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e CV_MODEL_PATH=cv_model/models/poc2/best.pt \
  simisai:latest
```

## 🌐 Deploy to Render

### Option 1: Using Render Blueprint (Recommended)

1. **Push code to GitHub**
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select `render-docker.yaml` as the blueprint

3. **Configure environment variables:**
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CV_MODEL_PATH=cv_model/models/poc2/best.pt`
   - Add other required environment variables

### Option 2: Manual Web Service

1. **Create new Web Service**
2. **Connect your GitHub repository**
3. **Configure:**
   - **Environment:** Docker
   - **Build Command:** `docker build -t simisai .`
   - **Start Command:** `docker run -p $PORT:3001 simisai`
   - **Health Check Path:** `/api/cv/health`

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `3001` |
| `CV_MODEL_PATH` | Path to YOLOv8 model | `cv_model/models/poc2/best.pt` |
| `DATABASE_URL` | Database connection string | (optional) |
| `SEALION_API_KEY` | Sealion API key | (optional) |
| `SEALION_API_URL` | Sealion API URL | (optional) |
| `SESSION_SECRET` | Session secret | (optional) |

## 📊 Resource Requirements

### Minimum Requirements
- **RAM:** 2GB (for YOLOv8 model loading)
- **CPU:** 1 vCPU
- **Storage:** 2GB

### Recommended
- **RAM:** 4GB
- **CPU:** 2 vCPU
- **Storage:** 5GB

## 🔍 Troubleshooting

### Common Issues

1. **Build fails with Python dependencies:**
   ```bash
   # Check if all Python packages are in requirements.txt
   cat cv_model/requirements.txt
   ```

2. **Model not found:**
   ```bash
   # Verify model file exists
   ls -la cv_model/models/poc2/best.pt
   ```

3. **Memory issues:**
   - Upgrade to a higher tier on Render
   - Consider model optimization

4. **Health check fails:**
   ```bash
   # Check container logs
   docker logs <container_name>
   ```

### Debug Commands

```bash
# Check container status
docker ps

# View logs
docker logs <container_name>

# Enter container
docker exec -it <container_name> /bin/bash

# Check Python environment
docker exec <container_name> python3 -c "import ultralytics; print('OK')"
```

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│           Docker Container          │
├─────────────────────────────────────┤
│  Node.js (Express) Backend          │
│  ├── API Routes (/api/*)            │
│  ├── Static File Serving            │
│  └── Python CV Integration          │
├─────────────────────────────────────┤
│  React Frontend (Built)             │
│  ├── Camera Interface               │
│  ├── Device Library                 │
│  └── Chat Interface                 │
├─────────────────────────────────────┤
│  Python CV Model                    │
│  ├── YOLOv8 Model (best.pt)        │
│  ├── OpenCV Dependencies            │
│  └── Image Processing               │
└─────────────────────────────────────┘
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t simisai .
      - name: Test locally
        run: |
          docker run -d --name test -p 3001:3001 simisai
          sleep 10
          curl -f http://localhost:3001/api/cv/health
          docker stop test && docker rm test
```

## 📈 Monitoring

### Health Checks
- **Endpoint:** `/api/cv/health`
- **Expected Response:** `{"healthy": true, "model_info": {...}}`

### Logs
- **Application logs:** Available in Render dashboard
- **Docker logs:** `docker logs <container_name>`

## 🚀 Performance Tips

1. **Use multi-stage builds** for smaller images
2. **Optimize model loading** with lazy loading
3. **Cache Python dependencies** in Docker layers
4. **Use CDN** for static assets in production

## 🔐 Security

- **Non-root user** in container
- **Environment variables** for secrets
- **Health checks** for monitoring
- **Resource limits** to prevent abuse

## 📞 Support

For issues with this deployment:
1. Check the troubleshooting section
2. Review container logs
3. Verify environment variables
4. Test locally first
