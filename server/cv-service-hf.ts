import fetch from 'node-fetch';

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  class_id: number;
}

export interface CVResponse {
  detections: DetectionResult[];
  processing_time: number;
  image_size: [number, number];
}

export class CVServiceHF {
  private apiUrl: string;

  constructor() {
    // This will be your Hugging Face Spaces URL
    // Format: https://your-username-simisai1-0.hf.space
    this.apiUrl = process.env.HF_SPACES_URL || 'https://your-username-simisai1-0.hf.space';
    
    console.log('CV Service HF initialized with:');
    console.log(`- API URL: ${this.apiUrl}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }

  /**
   * Process base64 image data using Hugging Face Spaces API
   */
  async detectObjectsFromBase64(base64Data: string): Promise<CVResponse> {
    try {
      console.log('Calling Hugging Face Spaces API...');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication if token is available
      if (process.env.HUGGINGFACE_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_TOKEN}`;
      }
      
      const response = await fetch(`${this.apiUrl}/run/predict`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: [base64Data]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as any;
      
      // Hugging Face Spaces returns data in a specific format
      // The actual result is in result.data[0]
      const apiResult = result.data[0];
      
      console.log('HF API response received:', {
        detections: apiResult.detections?.length || 0,
        processing_time: apiResult.processing_time
      });

      return {
        detections: apiResult.detections || [],
        processing_time: apiResult.processing_time || 0,
        image_size: apiResult.image_size || [0, 0]
      };

    } catch (error) {
      console.error('HF API error:', error);
      throw new Error(`Failed to call Hugging Face API: ${error}`);
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: this.apiUrl,
      model_type: 'YOLOv8 (Hugging Face Spaces)',
      classes: [
        'thermometer (Lo error)',
        'thermometer (measuring)',
        'thermometer (no display found)',
        'thermometer (off)',
        'thermometer button',
        'thermometer in ear',
        'thermometer in mouth',
        'thermometer in nose',
        'thermometer on face'
      ]
    };
  }

  /**
   * Health check for the CV service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication if token is available
      if (process.env.HUGGINGFACE_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.HUGGINGFACE_TOKEN}`;
      }
      
      const response = await fetch(`${this.apiUrl}/run/predict`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: [''] // Empty base64 data for health check
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('HF API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cvServiceHF = new CVServiceHF();
