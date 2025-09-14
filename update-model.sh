#!/bin/bash
# SIMISAI CV Model Update Script
# This script updates your AWS CV model with a new .pt file

set -e

echo "🔄 SIMISAI CV Model Update Script"
echo "================================="

# Configuration
AWS_IP="54.212.12.203"
KEY_PATH="$HOME/.ssh/simisai-cv-key.pem"
CONTAINER_NAME="simisai-cv-production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if model file is provided
if [ "$#" -ne 1 ]; then
    print_error "Usage: $0 <path-to-new-model.pt>"
    echo "Example: $0 cv_model/models/poc2/best.pt"
    exit 1
fi

MODEL_FILE="$1"

# Check if model file exists
if [ ! -f "$MODEL_FILE" ]; then
    print_error "Model file not found: $MODEL_FILE"
    exit 1
fi

print_status "Found model file: $MODEL_FILE"

# Check if SSH key exists
if [ ! -f "$KEY_PATH" ]; then
    print_error "SSH key not found: $KEY_PATH"
    echo "Make sure you ran the AWS setup first!"
    exit 1
fi

print_status "SSH key found: $KEY_PATH"

# Test connection to AWS
print_status "Testing connection to AWS instance..."
if ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$AWS_IP 'echo "Connection successful"' > /dev/null 2>&1; then
    print_status "Connected to AWS instance: $AWS_IP"
else
    print_error "Cannot connect to AWS instance: $AWS_IP"
    print_warning "Make sure the instance is running and accessible"
    exit 1
fi

# Get model file info
MODEL_SIZE=$(ls -lh "$MODEL_FILE" | awk '{print $5}')
print_status "Model file size: $MODEL_SIZE"

# Create backup of current model
print_status "Creating backup of current model..."
ssh -i "$KEY_PATH" ubuntu@$AWS_IP "
    if [ -f ~/simisai-cv-ubuntu-fixed/models/poc2/best.pt ]; then
        cp ~/simisai-cv-ubuntu-fixed/models/poc2/best.pt ~/simisai-cv-ubuntu-fixed/models/poc2/best.pt.backup-\$(date +%Y%m%d-%H%M%S)
        echo 'Backup created'
    else
        echo 'No existing model to backup'
    fi
"

# Upload new model
print_status "Uploading new model to AWS..."
if scp -i "$KEY_PATH" "$MODEL_FILE" ubuntu@$AWS_IP:~/simisai-cv-ubuntu-fixed/models/poc2/best.pt; then
    print_status "Model uploaded successfully"
else
    print_error "Failed to upload model"
    exit 1
fi

# Restart the container
print_status "Restarting CV service container..."
ssh -i "$KEY_PATH" ubuntu@$AWS_IP "
    echo 'Stopping current container...'
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true

    echo 'Starting container with new model...'
    cd ~/simisai-cv-ubuntu-fixed
    docker run -d -p 5000:5000 --name $CONTAINER_NAME simisai-cv-ubuntu-fixed

    echo 'Waiting for container to start...'
    sleep 10
"

# Test the updated service
print_status "Testing updated CV service..."
HEALTH_RESPONSE=$(curl -s http://$AWS_IP:5000/health || echo "FAILED")

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_status "CV service is healthy with new model!"

    # Extract model info
    MODEL_CLASSES=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('model_classes', 'Unknown'))" 2>/dev/null || echo "Unknown")
    print_status "Model loaded with $MODEL_CLASSES classes"

    # Show model info
    echo ""
    echo "🎉 Model Update Complete!"
    echo "========================"
    echo "• AWS Endpoint: http://$AWS_IP:5000"
    echo "• Model Classes: $MODEL_CLASSES"
    echo "• Container: $CONTAINER_NAME"
    echo "• Status: Ready for use"
    echo ""
    print_status "Your SIMISAI app will now use the updated model!"

else
    print_error "CV service health check failed!"
    print_warning "Response: $HEALTH_RESPONSE"

    # Try to get container logs
    echo ""
    echo "Container logs (last 10 lines):"
    ssh -i "$KEY_PATH" ubuntu@$AWS_IP "docker logs $CONTAINER_NAME --tail 10" || true

    # Restore backup if available
    print_warning "Attempting to restore backup..."
    ssh -i "$KEY_PATH" ubuntu@$AWS_IP "
        BACKUP_FILE=\$(ls -t ~/simisai-cv-ubuntu-fixed/models/poc2/best.pt.backup-* 2>/dev/null | head -1)
        if [ -n \"\$BACKUP_FILE\" ]; then
            echo \"Restoring backup: \$BACKUP_FILE\"
            cp \"\$BACKUP_FILE\" ~/simisai-cv-ubuntu-fixed/models/poc2/best.pt
            docker stop $CONTAINER_NAME || true
            docker rm $CONTAINER_NAME || true
            docker run -d -p 5000:5000 --name $CONTAINER_NAME simisai-cv-ubuntu-fixed
            echo \"Backup restored\"
        else
            echo \"No backup found\"
        fi
    "

    exit 1
fi