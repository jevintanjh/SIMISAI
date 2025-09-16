"""
SageMaker Inference Script for GGUF Model
Compatible with pre-built SageMaker PyTorch containers
System Architect Deployment - Sealion LLM
"""

import json
import os
import subprocess
import sys
import time
import requests
from typing import Dict, Any

def model_fn(model_dir):
    """
    Load the model. This function is called by SageMaker when the model is deployed.
    """
    print(f"Loading model from {model_dir}")
    
    # Install llama.cpp if not available
    try:
        import llama_cpp
        print("llama-cpp-python already available")
    except ImportError:
        print("Installing llama-cpp-python...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "llama-cpp-python"])
        import llama_cpp
    
    # Find the GGUF model file
    model_path = None
    for root, dirs, files in os.walk(model_dir):
        for file in files:
            if file.endswith('.gguf'):
                model_path = os.path.join(root, file)
                break
        if model_path:
            break
    
    if not model_path:
        raise ValueError(f"No GGUF model found in {model_dir}")
    
    print(f"Found model: {model_path}")
    
    # Initialize llama-cpp model
    try:
        llm = llama_cpp.Llama(
            model_path=model_path,
            n_ctx=2048,
            n_batch=512,
            n_threads=4,
            verbose=False
        )
        print("Model loaded successfully")
        return llm
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

def input_fn(request_body, request_content_type):
    """
    Parse input data. This function is called by SageMaker to parse the input.
    """
    print(f"Input content type: {request_content_type}")
    
    if request_content_type == 'application/json':
        return json.loads(request_body)
    else:
        # Handle plain text input
        return {"inputs": request_body}

def predict_fn(input_data, model):
    """
    Make predictions. This function is called by SageMaker to make predictions.
    """
    print(f"Making prediction with input: {input_data}")
    
    try:
        # Extract input text
        inputs = input_data.get('inputs', '')
        parameters = input_data.get('parameters', {})
        
        if not inputs:
            return {
                "error": "No input provided",
                "status": "error"
            }
        
        # Generate response using llama-cpp
        response = model(
            inputs,
            max_tokens=parameters.get('max_new_tokens', 150),
            temperature=parameters.get('temperature', 0.7),
            top_p=parameters.get('top_p', 0.9),
            stop=["</s>", "[INST]", "[/INST]"]
        )
        
        # Extract generated text
        generated_text = response['choices'][0]['text'] if 'choices' in response else str(response)
        
        return {
            "generated_text": generated_text,
            "status": "success",
            "model": "Gemma-SEA-LION-v4-27B-IT-Q4_K_M"
        }
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return {
            "error": str(e),
            "status": "error"
        }

def output_fn(prediction, content_type):
    """
    Format output. This function is called by SageMaker to format the output.
    """
    print(f"Output content type: {content_type}")
    
    if content_type == 'application/json':
        return json.dumps(prediction)
    else:
        return str(prediction)

# For local testing
if __name__ == "__main__":
    # Test the functions
    test_input = {
        "inputs": "Hello, how are you?",
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.7
        }
    }
    
    print("Testing SageMaker inference script...")
    print(f"Test input: {test_input}")
    
    # Note: This would require the actual model file for full testing
    print("Inference script ready for SageMaker deployment")
