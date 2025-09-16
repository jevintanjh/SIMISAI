#!/usr/bin/env python3

import os
import json
import logging
from flask import Flask, request
from llama_cpp import Llama

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global model instance
llm = None

def load_model():
    """Load the GGUF model"""
    global llm
    
    model_path = "/opt/program/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf"
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    logger.info(f"Loading model from {model_path}")
    
    # Initialize the model with CPU-optimized settings
    llm = Llama(
        model_path=model_path,
        n_ctx=2048,  # Context length
        n_threads=os.cpu_count(),  # Use all available CPU cores
        verbose=False
    )
    
    logger.info("Model loaded successfully")
    return llm

@app.route('/ping', methods=['GET'])
def ping():
    """Health check endpoint required by SageMaker"""
    global llm
    if llm is None:
        try:
            load_model()
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            return '', 500
    return '', 200

@app.route('/invocations', methods=['POST'])
def invocations():
    """Inference endpoint required by SageMaker"""
    try:
        # Parse input
        input_data = request.get_json()
        
        if not input_data:
            return {'error': 'No input data provided'}, 400
        
        prompt = input_data.get('prompt', '')
        max_tokens = input_data.get('max_tokens', 400)
        temperature = input_data.get('temperature', 0.2)
        
        if not prompt:
            return {'error': 'No prompt provided'}, 400
        
        logger.info(f"Generating response for prompt: {prompt[:100]}...")
        
        # Generate response
        response = llm(
            prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            stop=["</s>", "<|end_of_text|>"],
            echo=False
        )
        
        # Format response to match OpenAI-style format
        result = {
            "choices": [{
                "message": {
                    "content": response['choices'][0]['text'].strip()
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response['choices'][0]['text'].split()),
                "total_tokens": len(prompt.split()) + len(response['choices'][0]['text'].split())
            }
        }
        
        return json.dumps(result), 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        logger.error(f"Error during inference: {str(e)}")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    # Load model when starting
    try:
        load_model()
        logger.info("Model loaded successfully on startup")
    except Exception as e:
        logger.error(f"Failed to load model on startup: {str(e)}")
        # Don't exit, let the ping endpoint handle model loading
    
    # Start Flask app
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)