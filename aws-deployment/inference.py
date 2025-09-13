"""
SageMaker Serverless Inference for GGUF Model
System Architect Deployment - Sealion LLM
"""

import json
import os
import subprocess
import time
import signal
import sys
from typing import Dict, Any
import requests
import threading

class SealionInference:
    def __init__(self):
        self.model_path = os.environ.get('MODEL_PATH', '/opt/ml/model/Gemma-SEA-LION-v4-27B-IT-Q4_K_M.gguf')
        self.llama_cpp_path = os.environ.get('LLAMA_CPP_PATH', '/opt/llama.cpp')
        self.server_process = None
        self.server_ready = False
        self.server_thread = None
        
    def start_server(self):
        """Start llama.cpp server in background"""
        try:
            cmd = [
                f"{self.llama_cpp_path}/server",
                "-m", self.model_path,
                "--port", "8080",
                "--host", "0.0.0.0",
                "--ctx-size", "2048",
                "--batch-size", "512",
                "--threads", "4",
                "--n-gpu-layers", "0",  # CPU only for serverless
                "--verbose"
            ]
            
            print(f"Starting llama.cpp server with command: {' '.join(cmd)}")
            
            self.server_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for server to start
            self._wait_for_server()
            
        except Exception as e:
            print(f"Error starting server: {e}")
            raise
    
    def _wait_for_server(self):
        """Wait for server to be ready"""
        max_attempts = 30
        attempt = 0
        
        while attempt < max_attempts:
            try:
                response = requests.get("http://localhost:8080/health", timeout=5)
                if response.status_code == 200:
                    self.server_ready = True
                    print("Server is ready!")
                    return
            except:
                pass
            
            attempt += 1
            time.sleep(1)
            print(f"Waiting for server... attempt {attempt}/{max_attempts}")
        
        raise Exception("Server failed to start within timeout")
    
    def predict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle inference requests"""
        try:
            if not self.server_ready:
                return {
                    "error": "Server not ready",
                    "status": "error"
                }
            
            # Extract input text
            inputs = data.get('inputs', '')
            parameters = data.get('parameters', {})
            
            if not inputs:
                return {
                    "error": "No input provided",
                    "status": "error"
                }
            
            # Prepare request for llama.cpp
            request_data = {
                "prompt": inputs,
                "n_predict": parameters.get('max_new_tokens', 150),
                "temperature": parameters.get('temperature', 0.7),
                "top_p": parameters.get('top_p', 0.9),
                "stop": ["</s>", "[INST]", "[/INST]"]
            }
            
            print(f"Sending request: {request_data}")
            
            # Call llama.cpp server
            response = requests.post(
                "http://localhost:8080/completion",
                json=request_data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get('content', '')
                
                return {
                    "generated_text": generated_text,
                    "status": "success",
                    "model": "Gemma-SEA-LION-v4-27B-IT-Q4_K_M"
                }
            else:
                return {
                    "error": f"Server error: {response.status_code}",
                    "status": "error"
                }
                
        except Exception as e:
            print(f"Error in predict: {e}")
            return {
                "error": str(e),
                "status": "error"
            }
    
    def cleanup(self):
        """Cleanup server process"""
        if self.server_process:
            self.server_process.terminate()
            self.server_process.wait()

# Global inference instance
inference = SealionInference()

def handler(event, context):
    """SageMaker serverless handler"""
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Start server if not running
        if not inference.server_ready:
            inference.start_server()
        
        # Parse request
        if isinstance(event, str):
            data = json.loads(event)
        else:
            data = event
        
        # Get prediction
        result = inference.predict(data)
        
        print(f"Returning result: {json.dumps(result)}")
        
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
        
    except Exception as e:
        print(f"Handler error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e),
                "status": "error"
            })
        }

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    print("Received shutdown signal, cleaning up...")
    inference.cleanup()
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

if __name__ == "__main__":
    # For local testing
    test_event = {
        "inputs": "Hello, how are you?",
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.7
        }
    }
    
    result = handler(test_event, None)
    print(f"Test result: {result}")
