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

  constructor() {
    // Use environment variable to choose model source
    const modelPath = process.env.CV_MODEL_PATH;
    
    if (modelPath && modelPath.includes('/') && !modelPath.includes('cv_model')) {
      // Use Hugging Face model
      this.modelPath = modelPath;
      console.log(`Using Hugging Face model: ${modelPath}`);
    } else {
      // Use local model
      this.modelPath = path.resolve(process.cwd(), 'cv_model/models/poc1/weights/best.pt');
      console.log(`Using local model: ${this.modelPath}`);
    }
    
    this.pythonScript = path.resolve(process.cwd(), 'cv_model/detect_screen.py');
    
    // Log the current configuration
    console.log('CV Service initialized with:');
    console.log(`- Model path: ${this.modelPath}`);
    console.log(`- Python script: ${this.pythonScript}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }

  /**
   * Process an image and return detections
   * This is where you implement your CV logic
   */
  async detectObjects(imagePath: string): Promise<CVResponse> {
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
}

// Export singleton instance
export const cvService = new CVService();
