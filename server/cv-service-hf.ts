import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

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
  private modelPath: string;
  private pythonScript: string;

  constructor() {
    // Use Hugging Face model instead of local
    this.modelPath = 'spizzray/simisai1.0'; // Replace with your username
    
    this.pythonScript = path.resolve(process.cwd(), 'cv_model/detect_screen.py');
  }

  /**
   * Process an image using Hugging Face model
   */
  async detectObjects(imagePath: string): Promise<CVResponse> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Spawn Python process for inference with HF model
      const pythonProcess = spawn('python', [
        this.pythonScript,
        '--model', this.modelPath,
        '--image', imagePath,
        '--conf', '0.5',
        '--output', 'json'
      ]);

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
      model_type: 'YOLOv8 (Hugging Face)',
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

// Export singleton instance
export const cvServiceHF = new CVServiceHF();
