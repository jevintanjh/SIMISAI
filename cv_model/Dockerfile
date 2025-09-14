# Use Python 3.11 slim image for better compatibility and smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for OpenCV and PyTorch
RUN apt-get update && apt-get install -y \
    libgl1-mesa-dri \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Add Flask to requirements
RUN echo "Flask>=2.3.0" >> requirements.txt && \
    echo "flask-cors>=4.0.0" >> requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy model files
COPY models/ ./models/

# Copy API server
COPY api_server.py .

# Create a non-root user for security
RUN useradd -m -u 1000 apiuser && chown -R apiuser:apiuser /app
USER apiuser

# Expose port 5000
EXPOSE 5000

# Environment variables
ENV MODEL_PATH=/app/models/poc2/best.pt
ENV HOST=0.0.0.0
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# curl is already installed above

# Start the API server
CMD ["python", "api_server.py"]