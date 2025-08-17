FROM python:3.11-slim

# Keep Python lean and unbuffered; cap thread usage for BLAS backends
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1

# System libs required by Ultralytics / OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Render provides $PORT at runtime; force a single worker to reduce RAM
CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render provides $PORT at runtime. Default to 10000 for local runs.
CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}"]


