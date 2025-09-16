# 🚀 SageMaker Serverless GGUF Deployment Guide - System Architect

## 🎯 **Overview**
This guide addresses the compatibility issues you encountered and provides a robust deployment strategy for the **Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf** model on AWS SageMaker serverless inference.

## 🔍 **Research Findings**

### **Key Compatibility Issues Identified:**
1. **GGUF Model Format**: Requires llama.cpp or compatible inference engine
2. **Serverless Constraints**: Memory and timeout limitations
3. **Container Dependencies**: Custom inference code needed
4. **Model Size**: 16.5GB Q4_K_M model requires careful resource planning

### **Recommended Approach:**
- **SageMaker Serverless Inference** with custom container
- **llama.cpp** integration for GGUF compatibility
- **Optimized container** for serverless constraints

## 🏗️ **Deployment Architecture**

### **Option 1: SageMaker Serverless Inference (Recommended)**
```
┌─────────────────────────────────────────┐
│           SageMaker Serverless          │
│  ┌─────────────────────────────────────┐ │
│  │        Custom Container            │ │
│  │  ┌─────────────────────────────────┐│ │
│  │  │        llama.cpp               ││ │
│  │  │  ┌─────────────────────────────┐││ │
│  │  │  │  GGUF Model (16.5GB)       │││ │
│  │  │  │  Gemma-SEA-LION-v4-27B     │││ │
│  │  │  └─────────────────────────────┘││ │
│  │  └─────────────────────────────────┘│ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Option 2: SageMaker Real-time Endpoint (Alternative)**
- Higher cost but more reliable
- Better for production workloads
- More memory and compute resources

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Model Directory**
```bash
# Your model is downloading to:
D:\Users\Cursor\SIMISAI\sealion_model\

# Verify the model file:
ls "D:\Users\Cursor\SIMISAI\sealion_model\Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
```

### **Step 2: Create Custom Inference Container**

#### **Dockerfile for SageMaker Serverless:**
```dockerfile
FROM public.ecr.aws/lambda/python:3.11

# Install system dependencies
RUN yum update -y && \
    yum install -y gcc gcc-c++ make cmake git && \
    yum clean all

# Install llama.cpp
RUN git clone https://github.com/ggerganov/llama.cpp.git /opt/llama.cpp && \
    cd /opt/llama.cpp && \
    make -j$(nproc)

# Copy model and inference code
COPY model/ /opt/ml/model/
COPY inference.py /opt/ml/code/inference.py

# Set environment variables
ENV MODEL_PATH=/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf
ENV LLAMA_CPP_PATH=/opt/llama.cpp

# Set working directory
WORKDIR /opt/ml/code

# Default command
CMD ["python", "inference.py"]
```

#### **Inference Script (inference.py):**
```python
import json
import os
import subprocess
import tempfile
from typing import Dict, Any

class SealionInference:
    def __init__(self):
        self.model_path = os.environ.get('MODEL_PATH', '/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf')
        self.llama_cpp_path = os.environ.get('LLAMA_CPP_PATH', '/opt/llama.cpp')
        self.server_process = None
        
    def start_server(self):
        """Start llama.cpp server"""
        cmd = [
            f"{self.llama_cpp_path}/server",
            "-m", self.model_path,
            "--port", "8080",
            "--host", "0.0.0.0",
            "--ctx-size", "2048",
            "--batch-size", "512",
            "--threads", "4"
        ]
        
        self.server_process = subprocess.Popen(cmd)
        
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle inference requests"""
        try:
            # Extract input text
            inputs = data.get('inputs', '')
            parameters = data.get('parameters', {})
            
            # Prepare request
            request_data = {
                "prompt": inputs,
                "n_predict": parameters.get('max_new_tokens', 150),
                "temperature": parameters.get('temperature', 0.7),
                "top_p": parameters.get('top_p', 0.9)
            }
            
            # Call llama.cpp server
            import requests
            response = requests.post(
                "http://localhost:8080/completion",
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "generated_text": result.get('content', ''),
                    "status": "success"
                }
            else:
                return {
                    "error": f"Server error: {response.status_code}",
                    "status": "error"
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }

# Initialize inference
inference = SealionInference()

def handler(event, context):
    """Lambda handler for SageMaker"""
    try:
        # Start server if not running
        if inference.server_process is None:
            inference.start_server()
            
        # Parse request
        if isinstance(event, str):
            data = json.loads(event)
        else:
            data = event
            
        # Get prediction
        result = inference.predict(data)
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e),
                "status": "error"
            })
        }
```

### **Step 3: Build and Push Container**

#### **Build Script (build-container.ps1):**
```powershell
# Build SageMaker Container for GGUF Model
Write-Host "Building SageMaker container for GGUF model..." -ForegroundColor Blue

# Set variables
$region = "us-east-1"
$accountId = "710743745504"
$repositoryName = "simisai-sealion-gguf"
$imageTag = "latest"

# Create ECR repository
Write-Host "Creating ECR repository..." -ForegroundColor Cyan
aws ecr create-repository --repository-name $repositoryName --region $region

# Get login token
Write-Host "Logging into ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $accountId.dkr.ecr.$region.amazonaws.com

# Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t $repositoryName .

# Tag image
Write-Host "Tagging image..." -ForegroundColor Cyan
docker tag $repositoryName`:latest $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName`:latest

# Push image
Write-Host "Pushing image to ECR..." -ForegroundColor Cyan
docker push $accountId.dkr.ecr.$region.amazonaws.com/$repositoryName`:latest

Write-Host "Container build complete!" -ForegroundColor Green
```

### **Step 4: Create SageMaker Model**

#### **Model Creation Script:**
```bash
# Create SageMaker model
aws sagemaker create-model \
  --model-name "simisai-sealion-gguf-model" \
  --execution-role-arn "arn:aws:iam::710743745504:role/SageMakerExecutionRole" \
  --primary-container '{
    "Image": "710743745504.dkr.ecr.us-east-1.amazonaws.com/simisai-sealion-gguf:latest",
    "ModelDataUrl": "s3://simisai-production-frontend/sealion_model/",
    "Environment": {
      "MODEL_PATH": "/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
    }
  }'
```

### **Step 5: Create Serverless Endpoint Configuration**

#### **Endpoint Configuration:**
```bash
# Create endpoint configuration
aws sagemaker create-endpoint-config \
  --endpoint-config-name "simisai-sealion-serverless-config" \
  --production-variants '[
    {
      "VariantName": "sealion-variant",
      "ModelName": "simisai-sealion-gguf-model",
      "ServerlessConfig": {
        "MemorySizeInMB": 10240,
        "MaxConcurrency": 10
      }
    }
  ]'
```

### **Step 6: Deploy Endpoint**

#### **Deploy Endpoint:**
```bash
# Create endpoint
aws sagemaker create-endpoint \
  --endpoint-name "simisai-sealion-serverless-endpoint" \
  --endpoint-config-name "simisai-sealion-serverless-config"
```

## ⚠️ **Compatibility Considerations**

### **Memory Requirements:**
- **Q4_K_M Model**: 16.5GB
- **Serverless Memory**: 10GB maximum
- **Solution**: Use model quantization or real-time endpoint

### **Cold Start Issues:**
- **Problem**: Serverless endpoints have cold start delays
- **Solution**: Implement warm-up requests or use real-time endpoints

### **Timeout Constraints:**
- **Serverless**: 15-minute maximum
- **Solution**: Optimize inference speed with llama.cpp parameters

## 🔧 **Alternative: Real-time Endpoint**

If serverless has limitations, use real-time endpoint:

```bash
# Create real-time endpoint configuration
aws sagemaker create-endpoint-config \
  --endpoint-config-name "simisai-sealion-realtime-config" \
  --production-variants '[
    {
      "VariantName": "sealion-variant",
      "ModelName": "simisai-sealion-gguf-model",
      "InstanceType": "ml.g5.2xlarge",
      "InitialInstanceCount": 1
    }
  ]'
```

## 📊 **Cost Optimization**

### **Serverless vs Real-time:**
- **Serverless**: Pay per request, good for sporadic usage
- **Real-time**: Pay per hour, better for consistent usage

### **Model Optimization:**
- **Q4_K_M**: Good balance of size and quality
- **Consider**: Q8_0 for better quality (28.7GB)
- **Alternative**: Q4_0 for smaller size

## 🚀 **Integration with Lambda**

### **Update Lambda Function:**
```javascript
// Update your Lambda function to call SageMaker
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    const payload = {
        inputs: message,
        parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.9
        }
    };
    
    const command = new InvokeEndpointCommand({
        EndpointName: 'simisai-sealion-serverless-endpoint',
        ContentType: 'application/json',
        Body: JSON.stringify(payload)
    });
    
    const response = await sagemakerClient.send(command);
    // Process response...
};
```

## 🎯 **System Architect Recommendations**

### **Immediate Actions:**
1. **Verify model download** in `D:\Users\Cursor\SIMISAI\sealion_model\`
2. **Create ECR repository** for custom container
3. **Build and test container** locally first
4. **Start with real-time endpoint** for reliability

### **Long-term Strategy:**
1. **Monitor costs** and optimize based on usage
2. **Implement caching** for frequent requests
3. **Set up monitoring** with CloudWatch
4. **Consider model updates** as new versions become available

---

## 📞 **System Architect Support**

The System Architect is ready to:
- **Help build the custom container** for GGUF deployment
- **Set up ECR repository** and push the image
- **Create SageMaker model** and endpoint
- **Integrate with your Lambda function** for chat service
- **Test end-to-end functionality** with the Sealion LLM

**Ready to proceed with GGUF deployment once your model download completes!** 🏗️
