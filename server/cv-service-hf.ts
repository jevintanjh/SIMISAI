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
    // Prefer a generic remote CV URL (e.g., Render), then fall back to HF Spaces URL
    const remote = (process.env.CV_REMOTE_URL || process.env.HF_SPACES_URL || 'https://your-username-simisai1-0.hf.space').trim();
    // Normalize by removing trailing slash
    this.apiUrl = remote.replace(/\/+$/, '');

    console.log('CV Service HF initialized with:');
    console.log(`- API URL: ${this.apiUrl}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }

  /**
   * Process base64 image data using Hugging Face Spaces API
   */
  async detectObjectsFromBase64(base64Data: string): Promise<CVResponse> {
    try {
      console.log('Calling Remote CV API...', this.apiUrl);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(`${this.apiUrl}/detect`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageData: base64Data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResult = await response.json() as any;

      console.log('Remote CV response received:', {
        detections: apiResult?.detections?.length || 0,
        processing_time: apiResult?.processing_time
      });

      return {
        detections: apiResult?.detections || [],
        processing_time: apiResult?.processing_time || 0,
        image_size: apiResult?.image_size || [0, 0]
      };

    } catch (error) {
      console.error('Remote CV API error:', error);
      throw new Error(`Failed to call Remote CV API: ${error}`);
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: this.apiUrl,
      model_type: 'YOLOv8 (Remote CV)',
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
      const response = await fetch(`${this.apiUrl}/health`, { method: 'GET' });
      return response.ok;
    } catch (error) {
      console.error('Remote CV health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cvServiceHF = new CVServiceHF();
