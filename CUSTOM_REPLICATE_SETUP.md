# 🎯 Deploy Your Custom YOLOv8 Model to Replicate

## 🚀 **Why This Approach?**

✅ **Your Custom Model**: Uses your trained `best.pt` model specifically for thermometer detection  
✅ **No Local Processing**: Model runs entirely on Replicate's cloud infrastructure  
✅ **Fast & Reliable**: Production-ready ML infrastructure  
✅ **Cost Effective**: Pay per prediction, no server maintenance  

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Model**

Your custom model is already prepared in:
- `cv_model/models/poc2/best.pt` - Your trained YOLOv8 model
- `replicate-model/predict.py` - Replicate prediction script
- `replicate-model/requirements.txt` - Dependencies
- `replicate-model/README.md` - Documentation

### **Step 2: Deploy to Replicate**

Run the deployment script:

```bash
./deploy-to-replicate.sh
```

This script will:
1. ✅ Copy your `best.pt` model to the Replicate directory
2. ✅ Install Replicate CLI if needed
3. ✅ Guide you through authentication
4. ✅ Create your custom model on Replicate
5. ✅ Upload all files and deploy

### **Step 3: Get Your Model URL**

After deployment, you'll get a model URL like:
```
username/simisai-thermometer-detection:latest
```

### **Step 4: Update Your App**

Add the model URL to your `.env` file:

```env
# Replicate Configuration
REPLICATE_API_TOKEN=r8_DUqcMSMYvT6EP9eFK068Hf0Pa27VLAu0l3oFD
REPLICATE_MODEL_VERSION=username/simisai-thermometer-detection:latest
```

### **Step 5: Test Your Setup**

Restart your app and test:

```bash
npm run dev
curl http://localhost:3001/api/cv/health
```

## 🔧 **Manual Deployment (Alternative)**

If the script doesn't work, deploy manually:

### **1. Install Replicate CLI**
```bash
pip install replicate
```

### **2. Login to Replicate**
```bash
replicate auth login
```

### **3. Create Model**
```bash
replicate models create \
  --name "simisai-thermometer-detection" \
  --description "Custom YOLOv8 model for thermometer detection" \
  --visibility public
```

### **4. Upload Model Files**
```bash
cd replicate-model
replicate models versions create \
  --name "simisai-thermometer-detection" \
  --file predict.py \
  --file requirements.txt \
  --file README.md \
  --file best.pt
```

## 🎯 **What Your Custom Model Does**

Your `best.pt` model is specifically trained to detect:

1. **thermometer (Lo error)** - Thermometer showing low battery/error
2. **thermometer (measuring)** - Thermometer actively measuring
3. **thermometer (no display found)** - Thermometer with no readable display
4. **thermometer (off)** - Thermometer in off state
5. **thermometer button** - Thermometer control buttons
6. **thermometer in ear** - Ear thermometer in use
7. **thermometer in mouth** - Oral thermometer in use
8. **thermometer in nose** - Nasal thermometer in use
9. **thermometer on face** - Forehead thermometer in use

## 💰 **Pricing**

- **Free Tier**: 500 predictions/month
- **Paid**: ~$0.01 per prediction
- **No Setup Fees**: Pay only for what you use

## 🚨 **Troubleshooting**

### **Model Not Found Error**
- Ensure `best.pt` exists in `cv_model/models/poc2/`
- Check file permissions

### **Authentication Error**
- Verify your Replicate API token
- Run `replicate auth login` again

### **Deployment Error**
- Check internet connection
- Ensure Replicate CLI is installed
- Try manual deployment steps

## 🎉 **Success Indicators**

✅ Health check shows: `"model_type": "YOLOv8 (Replicate)"`  
✅ Detections work with your custom classes  
✅ No local model processing  
✅ Fast response times (~1-3 seconds)  

## 📞 **Next Steps**

1. **Deploy**: Run `./deploy-to-replicate.sh`
2. **Test**: Verify detections work
3. **Scale**: Your app is now production-ready!

Your custom thermometer detection model will run entirely in the cloud! 🚀
