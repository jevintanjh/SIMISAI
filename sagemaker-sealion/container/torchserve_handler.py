"""
TorchServe handler for SEA-LION 27B GGUF model
"""

import os
import json
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEA_LIONHandler:
    def __init__(self):
        self.model = None
        self.context = None
        self.initialized = False
        self.model_path = None

    def initialize(self, context):
        """Initialize the model"""
        self.context = context
        
        try:
            logger.info("Initializing SEA-LION handler...")
            
            # Find the GGUF model file in the model directory
            model_dir = context.system_properties.get("model_dir", "/opt/ml/model")
            logger.info(f"Looking for GGUF model in: {model_dir}")
            
            # Search for GGUF files
            gguf_files = []
            for root, dirs, files in os.walk(model_dir):
                for file in files:
                    if file.endswith('.gguf'):
                        gguf_files.append(os.path.join(root, file))
            
            if not gguf_files:
                raise FileNotFoundError(f"No GGUF model files found in {model_dir}")
            
            self.model_path = gguf_files[0]
            logger.info(f"Found GGUF model: {self.model_path}")
            
            # Try to load the model with llama-cpp-python
            try:
                from llama_cpp import Llama
                logger.info("Loading SEA-LION GGUF model...")
                
                self.model = Llama(
                    model_path=self.model_path,
                    n_ctx=2048,  # Context length
                    n_threads=4,  # Use 4 threads for SageMaker
                    verbose=False,
                    n_gpu_layers=0,  # CPU only
                    use_mmap=True,
                    use_mlock=True
                )
                
                logger.info("SEA-LION model loaded successfully!")
                self.initialized = True
                
            except ImportError:
                logger.error("llama-cpp-python not available in TorchServe container")
                logger.info("Falling back to mock responses")
                self.initialized = True
                
            except Exception as e:
                logger.error(f"Failed to load SEA-LION model: {str(e)}")
                logger.info("Falling back to mock responses")
                self.initialized = True
                
        except Exception as e:
            logger.error(f"Handler initialization failed: {str(e)}")
            self.initialized = True  # Still allow handler to work with mock responses
            
        return True

    def preprocess(self, data: List[Dict[str, Any]]) -> str:
        """Preprocess the input data"""
        if not data:
            raise ValueError("No input data provided")
        
        # Extract the first input
        input_data = data[0]
        
        # Handle different input formats
        if "body" in input_data:
            # Direct body
            body = input_data["body"]
            if isinstance(body, bytes):
                body = body.decode('utf-8')
            if isinstance(body, str):
                try:
                    body = json.loads(body)
                except:
                    body = {"prompt": body}
        else:
            body = input_data
        
        # Extract prompt
        if "prompt" in body:
            prompt = body["prompt"]
        elif "messages" in body:
            # Convert messages to prompt format
            messages = body["messages"]
            if isinstance(messages, list) and len(messages) > 0:
                last_message = messages[-1]
                if "content" in last_message:
                    prompt = last_message["content"]
                else:
                    prompt = str(last_message)
            else:
                prompt = str(messages)
        else:
            prompt = str(body)
        
        logger.info(f"Preprocessed prompt: {prompt[:100]}...")
        return prompt

    def inference(self, prompt: str) -> Dict[str, Any]:
        """Run inference on the prompt"""
        logger.info(f"Running inference on prompt: {prompt[:100]}...")
        
        try:
            # Check if we have the actual model loaded
            if self.model is not None:
                logger.info("Using actual SEA-LION model for inference")
                
                # Create a proper prompt for SEA-LION
                formatted_prompt = self._format_prompt(prompt)
                
                # Generate response using the actual model
                response = self.model(
                    formatted_prompt,
                    max_tokens=400,
                    temperature=0.7,
                    stop=["</s>", "<|end_of_text|>", "[INST]", "[/INST]"],
                    echo=False
                )
                
                # Extract the generated text
                generated_text = response['choices'][0]['text'].strip()
                
                logger.info(f"Generated response: {generated_text[:100]}...")
                
                return {
                    "choices": [{
                        "message": {
                            "content": generated_text
                        },
                        "finish_reason": "stop"
                    }],
                    "usage": {
                        "prompt_tokens": len(formatted_prompt.split()),
                        "completion_tokens": len(generated_text.split()),
                        "total_tokens": len(formatted_prompt.split()) + len(generated_text.split())
                    }
                }
            else:
                # Fallback to mock response if model not loaded
                logger.info("Using mock response - model not available")
                return self._get_mock_response(prompt)
                
        except Exception as e:
            logger.error(f"Error during inference: {str(e)}")
            return self._get_mock_response(prompt)
    
    def _format_prompt(self, user_input: str) -> str:
        """Format the user input into a proper prompt for SEA-LION"""
        # SEA-LION instruction format
        formatted_prompt = f"""<|im_start|>system
You are SEA-LION, an advanced AI assistant specialized in medical device troubleshooting and ASEAN language support. Provide helpful, accurate, and concise responses.
<|im_end|>
<|im_start|>user
{user_input}
<|im_end|>
<|im_start|>assistant
"""
        return formatted_prompt
    
    def _get_mock_response(self, prompt: str) -> Dict[str, Any]:
        """Get a mock response when the model is not available"""
        return {
            "choices": [{
                "message": {
                    "content": f"SEA-LION Response: I understand you're asking about '{prompt[:50]}...'. This is a mock response from the SEA-LION model handler. The actual model loading will be implemented once llama-cpp-python dependencies are resolved."
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": 25,
                "total_tokens": len(prompt.split()) + 25
            }
        }

    def postprocess(self, inference_output: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Postprocess the inference output"""
        logger.info("Postprocessing output...")
        
        # Return the response in the expected format
        result = {
            "response": inference_output["choices"][0]["message"]["content"],
            "usage": inference_output["usage"]
        }
        
        logger.info("Postprocessing completed")
        return [result]

    def handle(self, data: List[Dict[str, Any]], context) -> List[Dict[str, Any]]:
        """Main handler function"""
        try:
            if not self.initialized:
                self.initialize(context)
            
            # Preprocess
            prompt = self.preprocess(data)
            
            # Inference
            inference_output = self.inference(prompt)
            
            # Postprocess
            result = self.postprocess(inference_output)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in handle: {str(e)}")
            error_response = {
                "error": str(e),
                "response": "SEA-LION model is currently unavailable due to initialization issues."
            }
            return [error_response]
