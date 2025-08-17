import { spawn } from 'child_process';
export interface CVDetection {
  class: string;
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface CVResponse {
  detections: CVDetection[];
  processing_time?: number;
  image_size?: [number, number];
  error?: string;
}

export class CVServiceReplicate {
  private apiToken: string;
  private modelVersion: string;

  constructor() {
    this.apiToken = process.env.REPLICATE_API_TOKEN || '';
    this.modelVersion = process.env.REPLICATE_MODEL_VERSION || '';
    
    if (!this.apiToken) {
      console.warn('⚠️  REPLICATE_API_TOKEN not set. Replicate service will not work.');
    }
    
    if (!this.modelVersion) {
      console.warn('⚠️  REPLICATE_MODEL_VERSION not set. Please set it to your custom model (e.g., username/model-name:latest)');
    }
    
    if (!this.apiToken) {
      console.warn('⚠️  REPLICATE_API_TOKEN not set. Replicate service will not work.');
    }
    
    console.log('CV Service Replicate initialized with:');
    console.log(`- Model version: ${this.modelVersion || 'NOT_SET'}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }

  /**
   * Process base64 image data using Replicate API
   */
  async detectObjectsFromBase64(base64Data: string): Promise<CVResponse> {
    try {
      console.log('Calling Replicate API...');
      
      if (!this.apiToken) {
        throw new Error('REPLICATE_API_TOKEN not configured');
      }

      // Convert base64 to data URL
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;
      
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.modelVersion,
          input: {
            image: dataUrl,
            conf: 0.5,
            iou: 0.45,
            agnostic_nms: false,
            max_det: 300,
            classes: null,
            retina_masks: false,
            imgsz: 640,
            half: false,
            verbose: false
          }
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Replicate API error: ${response.status} - ${errorBody}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const prediction = await response.json();
      console.log('Replicate prediction started:', prediction.id);

      // Poll for results
      const result = await this.pollPrediction(prediction.id);
      
      if (!result || !result.output) {
        throw new Error('No results from Replicate API');
      }

      // Parse YOLOv8 output format
      const detections = this.parseYOLOv8Output(result.output);
      
              return {
          detections,
          processing_time: result.metrics?.predict_time || 0,
          image_size: [640, 640] // Default YOLOv8 input size
        };

    } catch (error) {
      console.error('Replicate API error:', error);
      throw new Error(`Failed to call Replicate API: ${error}`);
    }
  }

  /**
   * Poll for prediction results
   */
  private async pollPrediction(predictionId: string): Promise<any> {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const prediction = await response.json();
        
        if (prediction.status === 'succeeded') {
          console.log('Replicate prediction completed');
          return prediction;
        } else if (prediction.status === 'failed') {
          throw new Error(`Prediction failed: ${prediction.error}`);
        } else if (prediction.status === 'processing' || prediction.status === 'starting') {
          console.log(`Replicate prediction status: ${prediction.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          attempts++;
        } else {
          throw new Error(`Unknown prediction status: ${prediction.status}`);
        }
      } catch (error) {
        console.error('Error polling prediction:', error);
        throw error;
      }
    }

    throw new Error('Prediction timeout');
  }

  /**
   * Parse YOLOv8 output format from Replicate
   */
  private parseYOLOv8Output(output: any): CVDetection[] {
    const detections: CVDetection[] = [];
    
    if (!output || !Array.isArray(output)) {
      return detections;
    }

    // YOLOv8 output format: [x1, y1, x2, y2, confidence, class_id]
    output.forEach((detection: number[]) => {
      if (detection.length >= 6) {
        const [x1, y1, x2, y2, confidence, classId] = detection;
        const className = this.getClassName(classId);
        
        if (className && confidence > 0.5) {
          detections.push({
            class: className,
            confidence: Math.round(confidence * 100) / 100,
            box: [Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2)]
          });
        }
      }
    });

    console.log(`Replicate detections found: ${detections.length}`);
    return detections;
  }

  /**
   * Get class name by ID
   */
  private getClassName(classId: number): string {
    const classes = this.getModelClasses();
    return classes[classId] || `class_${classId}`;
  }

  /**
   * Get model classes
   */
  getModelClasses(): string[] {
    return [
      'thermometer (Lo error)',
      'thermometer (measuring)',
      'thermometer (no display found)',
      'thermometer (off)',
      'thermometer button',
      'thermometer in ear',
      'thermometer in mouth',
      'thermometer in nose',
      'thermometer on face'
    ];
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: `replicate:${this.modelVersion}`,
      model_type: 'YOLOv8 (Replicate)',
      classes: this.getModelClasses()
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiToken) {
        return false;
      }

      // Test API connection
      const response = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Replicate health check failed:', error);
      return false;
    }
  }
}

export const cvServiceReplicate = new CVServiceReplicate();
