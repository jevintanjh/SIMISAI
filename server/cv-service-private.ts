import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  class_id: number;
}

export interface CVResponse {
  detections: DetectionResult[];
  processing_time: number;
  image_size: [number, number];
}

export class CVServicePrivate {
  private modelPath: string;
  private pythonScript: string;
  private hfToken: string;

  constructor() {
    // Get Hugging Face token from environment variable
    this.hfToken = process.env.HUGGINGFACE_TOKEN || '';
    
    if (!this.hfToken) {
      console.warn('⚠️ HUGGINGFACE_TOKEN not set. Private models may not work.');
    }
    
    // Use private model path
    this.modelPath = 'spizzray/simisai1.0'; // Your private model
    this.pythonScript = path.resolve(process.cwd(), 'cv_model/detect_screen.py');
  }

  /**
   * Process an image using private Hugging Face model
   */
  async detectObjects(imagePath: string): Promise<CVResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Set environment variables for Python process
      const env = {
        ...process.env,
        HUGGINGFACE_TOKEN: this.hfToken,
        HF_HUB_TOKEN: this.hfToken, // Alternative env var name
      };
      
      // Spawn Python process with authentication
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
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
    
    try {
      fs.writeFileSync(tempImagePath, base64Image, 'base64');
      const result = await this.detectObjects(tempImagePath);
      return result;
    } finally {
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
      model_type: 'YOLOv8 (Private Hugging Face)',
      has_token: !!this.hfToken,
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
}

export const cvServicePrivate = new CVServicePrivate();
