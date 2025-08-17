import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

export class CVService {
  private modelPath: string;
  private pythonScript: string;
  private remoteCvUrl: string | undefined;

  constructor() {
    // Optional remote CV endpoint (e.g., Hugging Face Space)
    this.remoteCvUrl = (process.env.CV_REMOTE_URL || '').trim() || undefined;
    if (this.remoteCvUrl) {
      // Normalize by removing trailing slash
      this.remoteCvUrl = this.remoteCvUrl.replace(/\/$/, '');
      console.log(`CV Service configured to use remote URL: ${this.remoteCvUrl}`);
    }
    // Use environment variable to choose model source
    const modelPath = process.env.CV_MODEL_PATH;
    
    if (modelPath && modelPath.includes('/') && !modelPath.includes('cv_model')) {
      // Use Hugging Face model
      this.modelPath = modelPath;
      console.log(`Using Hugging Face model: ${modelPath}`);
    } else {
      // Use local model
      this.modelPath = path.resolve(process.cwd(), 'cv_model/models/poc2/best.pt');
      console.log(`Using local model: ${this.modelPath}`);
    }
    
    this.pythonScript = path.resolve(process.cwd(), 'cv_model/detect_screen.py');
    
    // Log the current configuration
    console.log('CV Service initialized with:');
    console.log(`- Model path: ${this.modelPath}`);
    console.log(`- Python script: ${this.pythonScript}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
    console.log(`- Mode: ${this.remoteCvUrl ? 'REMOTE' : 'LOCAL_PYTHON'}`);
  }

  /**
   * Process an image and return detections
   * This is where you implement your CV logic
   */
  async detectObjects(imagePath: string): Promise<CVResponse> {
    // If configured, call remote CV service instead of local Python
    if (this.remoteCvUrl) {
      try {
        const fileBuffer = fs.readFileSync(imagePath);
        const b64 = fileBuffer.toString('base64');
        return this.detectRemoteFromBase64(b64);
      } catch (e) {
        return Promise.reject(new Error(`Failed to read image for remote CV: ${e instanceof Error ? e.message : String(e)}`));
      }
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Set environment variables for Python process
      const env = {
        ...process.env,
        HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN || '',
        HF_HUB_TOKEN: process.env.HUGGINGFACE_TOKEN || '',
      };
      
      // Spawn Python process for inference
      const pythonProcess = spawn('python', [
        this.pythonScript,
        '--model', this.modelPath,
        '--image', imagePath,
        '--conf', '0.5',
        '--output', 'json'
      ], { env });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        const processingTime = Date.now() - startTime;
        
        if (code !== 0) {
          console.error('Python script error:', errorOutput);
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve({
            detections: result.detections || [],
            processing_time: processingTime,
            image_size: result.image_size || [0, 0]
          });
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  /**
   * Process base64 image data
   */
  async detectObjectsFromBase64(base64Data: string): Promise<CVResponse> {
    // If configured, proxy to remote CV
    if (this.remoteCvUrl) {
      return this.detectRemoteFromBase64(base64Data.replace(/^data:image\/[a-z]+;base64,/, ''));
    }

    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create temporary file
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
    
    try {
      // Write base64 to file
      fs.writeFileSync(tempImagePath, base64Image, 'base64');
      
      // Process the image
      const result = await this.detectObjects(tempImagePath);
      
      return result;
    } finally {
      // Clean up temporary file
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: this.modelPath,
      model_type: 'YOLOv8',
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
      // If using remote CV, check remote health endpoint
      if (this.remoteCvUrl) {
        try {
          const res = await fetch(`${this.remoteCvUrl}/health`, { method: 'GET' });
          if (!res.ok) return false;
          const json = await res.json().catch(() => undefined as any);
          return Boolean(json && (json.healthy === true || json.status === 'ok'));
        } catch (e) {
          console.warn('Remote CV health check failed:', e);
          return false;
        }
      }

      // For Hugging Face models, we can't check if file exists locally
      if (this.modelPath.includes('/') && !this.modelPath.includes('cv_model')) {
        console.log('Hugging Face model detected, skipping local file check');
        // Just check if Python script exists
        if (!fs.existsSync(this.pythonScript)) {
          console.warn('Python script not found at:', this.pythonScript);
          return false;
        }
        return true;
      }
      
      // For local models, check if model file exists
      if (!fs.existsSync(this.modelPath)) {
        console.warn('Model file not found at:', this.modelPath);
        return false;
      }
      
      // Check if Python script exists
      if (!fs.existsSync(this.pythonScript)) {
        console.warn('Python script not found at:', this.pythonScript);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('CV service health check failed:', error);
      return false;
    }
  }

  /**
   * Call remote CV service with base64 image data
   */
  private async detectRemoteFromBase64(base64Image: string): Promise<CVResponse> {
    if (!this.remoteCvUrl) {
      throw new Error('Remote CV URL is not configured');
    }
    const start = Date.now();
    const endpoint = `${this.remoteCvUrl}/detect`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageData: base64Image })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Remote CV error ${res.status}: ${txt}`);
    }
    const data = await res.json();
    const processingTime = Date.now() - start;
    return {
      detections: Array.isArray(data?.detections) ? data.detections : [],
      processing_time: typeof data?.processing_time === 'number' ? data.processing_time : processingTime,
      image_size: Array.isArray(data?.image_size) ? data.image_size : [0, 0]
    };
  }
}

// Export singleton instance
export const cvService = new CVService();
