#!/usr/bin/env python3
"""
SageMaker inference handler for SEA-LION 27B GGUF model
"""

import os
import json
import logging
from llama_cpp import Llama

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance
llm = None

def model_fn(model_dir):
    """
    Load the model for inference
    This function is called once when the container starts
    """
    global llm
    
    logger.info(f"Loading model from {model_dir}")
    
    # Find the GGUF model file
    model_files = [f for f in os.listdir(model_dir) if f.endswith('.gguf')]
    if not model_files:
        raise FileNotFoundError(f"No GGUF model file found in {model_dir}")
    
    model_path = os.path.join(model_dir, model_files[0])
    logger.info(f"Using model file: {model_path}")
    
    # Initialize the model with CPU-optimized settings for SageMaker
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,  # Context length
        n_threads=os.cpu_count(),  # Use all available CPU cores
        verbose=False
    )
    
    logger.info("Model loaded successfully")
    return llm

def input_fn(request_body, request_content_type):
    """
    Parse input data for inference
    """
    logger.info(f"Received request with content type: {request_content_type}")
    
    if request_content_type == 'application/json':
        input_data = json.loads(request_body)
        logger.info(f"Parsed input data: {input_data}")
        return input_data
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model):
    """
    Run inference on the input data
    """
    global llm
    
    try:
        # Extract parameters from input
        prompt = input_data.get('prompt', '')
        max_tokens = input_data.get('max_tokens', 400)
        temperature = input_data.get('temperature', 0.2)
        
        if not prompt:
            raise ValueError('No prompt provided')
        
        logger.info(f"Generating response for prompt: {prompt[:100]}...")
        
        # Generate response using llama-cpp-python
        response = llm(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stop=["</s>", "<|end_of_text|>"],
            echo=False
        )
        
        logger.info("Response generated successfully")
        return response
        
    except Exception as e:
        logger.error(f"Error during inference: {str(e)}")
        raise e

def output_fn(prediction, content_type):
    """
    Format the prediction output
    """
    if content_type == 'application/json':
        # Format response to match OpenAI-style format
        result = {
            "choices": [{
                "message": {
                    "content": prediction['choices'][0]['text'].strip()
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(prediction.get('prompt', '').split()),
                "completion_tokens": len(prediction['choices'][0]['text'].split()),
                "total_tokens": len(prediction.get('prompt', '').split()) + len(prediction['choices'][0]['text'].split())
            }
        }
        
        return json.dumps(result)
    else:
        raise ValueError(f"Unsupported content type: {content_type}")