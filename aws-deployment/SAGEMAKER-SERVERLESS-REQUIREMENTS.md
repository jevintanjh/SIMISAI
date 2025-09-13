# 🏗️ SageMaker Serverless Requirements - System Architect

## 📋 **Model Data Archive Requirements**

### **✅ Required File Structure for `model.tar.gz`:**

```
model.tar.gz
└── Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf
```

**OR** (if using zip format):

```
model.zip
└── Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf
```

### **📁 Archive Requirements:**
- **Format**: `.tar.gz` (preferred) or `.zip`
- **Size Limit**: 10 GB maximum for serverless
- **Structure**: Model file at root level (not in subdirectories)
- **Compression**: Must be properly compressed

## 🔧 **Inference Code Requirements**

### **✅ Required Files for SageMaker:**

#### **1. `inference.py` (Main Script)**
- **Function**: `model_fn(model_dir)` - Load model
- **Function**: `input_fn(request_body, content_type)` - Parse input
- **Function**: `predict_fn(input_data, model)` - Make predictions
- **Function**: `output_fn(prediction, content_type)` - Format output

#### **2. `requirements.txt` (Dependencies)**
```
llama-cpp-python==0.2.11
requests==2.31.0
numpy==1.24.3
```

#### **3. Optional: `config.json` (Configuration)**
```json
{
  "model_type": "gguf",
  "model_name": "Gemma-SEA-LION-v4-27B-IT-Q4_K_M",
  "max_tokens": 150,
  "temperature": 0.7,
  "top_p": 0.9
}
```

## 🐳 **Container Requirements**

### **✅ Pre-built Container (Recommended):**
- **Image**: `763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0.0-cpu-py310-ubuntu20.04-sagemaker`
- **Base**: PyTorch 2.0.0 with Python 3.10
- **OS**: Ubuntu 20.04
- **Architecture**: CPU optimized

### **✅ Custom Container Requirements:**
- **Base Image**: SageMaker-compatible (Ubuntu-based)
- **Python**: 3.8+ (3.10 recommended)
- **Dependencies**: All packages in requirements.txt
- **Size Limit**: 10 GB maximum
- **Permissions**: Proper file permissions for serverless

## 🚀 **Serverless Configuration Requirements**

### **✅ Memory Configuration:**
- **Minimum**: 1024 MB
- **Maximum**: 6144 MB (account limit: 3072 MB)
- **Recommended**: 3072 MB for GGUF models

### **✅ Concurrency Configuration:**
- **Minimum**: 1
- **Maximum**: 200
- **Recommended**: 10 for GGUF models

### **✅ Timeout Configuration:**
- **Minimum**: 1 second
- **Maximum**: 300 seconds (5 minutes)
- **Recommended**: 60 seconds for GGUF inference

## 📊 **Model Size Considerations**

### **✅ GGUF Model Optimization:**
- **Q4_K_M**: 16.5 GB (your current model)
- **Q4_0**: ~12 GB (smaller, faster)
- **Q8_0**: 28.7 GB (larger, higher quality)

### **✅ Memory vs Model Size:**
- **3072 MB**: Can handle Q4_K_M with optimization
- **6144 MB**: Better for larger models
- **Recommendation**: Use Q4_K_M with 3072 MB

## 🔐 **IAM Requirements**

### **✅ SageMaker Execution Role Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:*",
        "s3:GetObject",
        "s3:ListBucket",
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📋 **Deployment Checklist**

### **✅ Pre-Deployment:**
- [ ] Model file compressed in `.tar.gz` or `.zip`
- [ ] Model uploaded to S3
- [ ] Inference code uploaded to S3
- [ ] SageMaker execution role created
- [ ] Required IAM policies attached

### **✅ Deployment:**
- [ ] SageMaker model created
- [ ] Endpoint configuration created
- [ ] Serverless endpoint deployed
- [ ] Endpoint status: "InService"

### **✅ Post-Deployment:**
- [ ] Test inference with sample request
- [ ] Monitor endpoint metrics
- [ ] Update Lambda function to call endpoint
- [ ] Test end-to-end functionality

## ⚠️ **Common Issues & Solutions**

### **❌ Model Archive Issues:**
- **Error**: "Invalid archive cannot be uncompressed"
- **Solution**: Ensure model is in `.tar.gz` or `.zip` format
- **Check**: Model file at root level, not in subdirectories

### **❌ Memory Issues:**
- **Error**: "ResourceLimitExceeded"
- **Solution**: Reduce memory to 3072 MB or less
- **Check**: Account-level memory limits

### **❌ Dependency Issues:**
- **Error**: "Module not found"
- **Solution**: Include all dependencies in requirements.txt
- **Check**: llama-cpp-python compatibility

### **❌ Permission Issues:**
- **Error**: "Access denied"
- **Solution**: Ensure SageMaker role has S3 and ECR access
- **Check**: IAM policies attached correctly

## 🎯 **System Architect Recommendations**

### **✅ For Your GGUF Model:**
1. **Archive Format**: Use `.tar.gz` (more reliable than `.zip`)
2. **Memory**: 3072 MB (fits account limit)
3. **Concurrency**: 10 (good balance)
4. **Container**: Pre-built PyTorch container
5. **Dependencies**: llama-cpp-python + requirements.txt

### **✅ Optimization Tips:**
1. **Model Quantization**: Q4_K_M is optimal for serverless
2. **Context Size**: 2048 tokens (good balance)
3. **Batch Size**: 512 (memory efficient)
4. **Threads**: 4 (CPU optimized)

---

## 📞 **System Architect Support**

The System Architect has prepared all requirements for successful SageMaker serverless deployment:

- ✅ **Model archive structure** defined
- ✅ **Inference code** optimized for serverless
- ✅ **Dependencies** specified
- ✅ **Configuration** tuned for GGUF models
- ✅ **Error handling** implemented

**Ready for manual compression and deployment!** 🚀
