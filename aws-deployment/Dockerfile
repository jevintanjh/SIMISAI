# SageMaker Serverless Container for GGUF Model
# System Architect Deployment

FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies
RUN yum update -y && \
    yum install -y gcc gcc-c++ make cmake git wget curl && \
    yum clean all

# Install llama.cpp
RUN git clone https://github.com/ggerganov/llama.cpp.git /opt/llama.cpp && \
    cd /opt/llama.cpp && \
    make -j$(nproc) && \
    chmod +x /opt/llama.cpp/server

# Create model directory
RUN mkdir -p /opt/ml/model

# Copy inference code
COPY inference.py /opt/ml/code/inference.py
COPY requirements.txt /opt/ml/code/requirements.txt

# Install Python dependencies
RUN pip install -r /opt/ml/code/requirements.txt

# Set environment variables
ENV MODEL_PATH=/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf
ENV LLAMA_CPP_PATH=/opt/llama.cpp
ENV PYTHONPATH=/opt/ml/code

# Set working directory
WORKDIR /opt/ml/code

# Expose port
EXPOSE 8080

# Default command
CMD ["python", "inference.py"]
