import json
import base64
import requests
import os
from typing import Dict, List, Any
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class CVServiceProxy:
    """
    CV Service Proxy for SIMISAI
    Handles communication with co-worker's CV service on AWS
    """
    
    def __init__(self):
        self.cv_endpoint = os.environ.get('CV_SERVICE_ENDPOINT')
        self.cv_token = os.environ.get('CV_SERVICE_TOKEN', '')
        self.timeout = int(os.environ.get('CV_SERVICE_TIMEOUT', '30'))
        
        if not self.cv_endpoint:
            raise ValueError("CV_SERVICE_ENDPOINT environment variable is required")
    
    def detect_devices(self, image_data: str, device_type: str = 'thermometer', 
                      confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """
        Detect medical devices in image using co-worker's CV service
        
        Args:
            image_data: Base64 encoded image data
            device_type: Type of device to detect (thermometer, bp_monitor, etc.)
            confidence_threshold: Minimum confidence for detections
            
        Returns:
            Dictionary with detection results
        """
        try:
            payload = {
                'image': image_data,
                'device_type': device_type,
                'confidence_threshold': confidence_threshold,
                'timestamp': self._get_timestamp()
            }
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'SIMISAI-CV-Proxy/1.0'
            }
            
            # Add authentication if token is provided
            if self.cv_token:
                headers['Authorization'] = f'Bearer {self.cv_token}'
            
            logger.info(f"Calling CV service at {self.cv_endpoint}")
            logger.info(f"Payload size: {len(json.dumps(payload))} bytes")
            
            response = requests.post(
                self.cv_endpoint,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"CV service success: {len(result.get('detections', []))} detections")
                
                return {
                    'success': True,
                    'detections': result.get('detections', []),
                    'processing_time': result.get('processing_time', 0),
                    'model_version': result.get('model_version', 'unknown'),
                    'confidence_threshold': confidence_threshold,
                    'device_type': device_type
                }
            else:
                logger.error(f"CV service error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'CV service returned status {response.status_code}',
                    'detections': [],
                    'fallback': True
                }
                
        except requests.exceptions.Timeout:
            logger.error("CV service timeout")
            return {
                'success': False,
                'error': 'CV service timeout',
                'detections': [],
                'fallback': True
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"CV service request error: {str(e)}")
            return {
                'success': False,
                'error': f'CV service request failed: {str(e)}',
                'detections': [],
                'fallback': True
            }
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'detections': [],
                'fallback': True
            }
    
    def get_fallback_detections(self, device_type: str = 'thermometer') -> List[Dict[str, Any]]:
        """
        Provide fallback detections when CV service is unavailable
        """
        fallback_detections = {
            'thermometer': [
                {
                    'class': 'thermometer (off)',
                    'confidence': 0.3,
                    'bbox': [100, 100, 200, 300],
                    'class_id': 4
                }
            ],
            'bp_monitor': [
                {
                    'class': 'bp_monitor (off)',
                    'confidence': 0.3,
                    'bbox': [150, 150, 250, 350],
                    'class_id': 1
                }
            ],
            'glucose_meter': [
                {
                    'class': 'glucose_meter (off)',
                    'confidence': 0.3,
                    'bbox': [120, 120, 220, 320],
                    'class_id': 2
                }
            ]
        }
        
        return fallback_detections.get(device_type, fallback_detections['thermometer'])
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.utcnow().isoformat() + 'Z'

def lambda_handler(event, context):
    """
    AWS Lambda handler for CV service proxy
    """
    logger.info(f"CV service event: {json.dumps(event)}")
    
    try:
        # Handle CORS
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        }
        
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        if event.get('httpMethod') == 'POST':
            # Parse request body
            body = json.loads(event.get('body', '{}'))
            
            image_data = body.get('image')
            device_type = body.get('device_type', 'thermometer')
            confidence_threshold = float(body.get('confidence_threshold', 0.5))
            
            if not image_data:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Image data is required'})
                }
            
            # Initialize CV service
            cv_service = CVServiceProxy()
            
            # Detect devices
            result = cv_service.detect_devices(image_data, device_type, confidence_threshold)
            
            # Add fallback detections if service failed
            if not result['success'] and result.get('fallback'):
                result['detections'] = cv_service.get_fallback_detections(device_type)
                result['fallback_used'] = True
                logger.info("Using fallback detections")
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result)
            }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Endpoint not found'})
        }
        
    except Exception as e:
        logger.error(f"Lambda error: {str(e)}")
        
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error',
                'message': str(e)
            })
        }

# For local testing
if __name__ == '__main__':
    # Test the CV service
    test_event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'image': 'base64_test_data',
            'device_type': 'thermometer',
            'confidence_threshold': 0.5
        })
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
