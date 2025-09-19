import fetch from 'node-fetch';
import https from 'https';

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

export class CVServiceRemote {
  private apiBaseUrl: string;
  private agent: https.Agent;

  constructor() {
    this.apiBaseUrl = (process.env.CV_REMOTE_URL || '').replace(/\/$/, '');
    // Create HTTPS agent that accepts self-signed certificates
    this.agent = new https.Agent({
      rejectUnauthorized: false
    });
    if (!this.apiBaseUrl) {
      console.warn('CVServiceRemote initialized without CV_REMOTE_URL');
    }
    console.log('CV Service Remote initialized with:');
    console.log(`- API URL: ${this.apiBaseUrl || 'NOT SET'}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
    console.log(`- SSL Verification: Disabled for self-signed certificates`);
  }

  async detectObjectsFromBase64(base64Data: string): Promise<CVResponse> {
    if (!this.apiBaseUrl) {
      throw new Error('CV_REMOTE_URL is not configured');
    }

    const url = `${this.apiBaseUrl}/predict`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const body = JSON.stringify({
      // Format expected by EC2 service
      imageData: base64Data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      agent: this.apiBaseUrl.startsWith('https:') ? this.agent : undefined
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Remote CV error ${response.status}: ${text}`);
    }

    const result = await response.json() as any;

    // Try to normalize a few possible response shapes
    const detections = result.detections || result.data?.[0]?.detections || [];
    const processing_time = result.processing_time || result.data?.[0]?.processing_time || 0;
    const image_size = (result.image_size || result.data?.[0]?.image_size || [0, 0]) as [number, number];

    return { detections, processing_time, image_size };
  }

  getModelInfo() {
    return {
      model_path: this.apiBaseUrl,
      model_type: 'YOLOv8 (Remote Microservice)',
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

  async healthCheck(): Promise<boolean> {
    if (!this.apiBaseUrl) return false;
    try {
      const url = `${this.apiBaseUrl}/health`;
      const res = await fetch(url, {
        method: 'GET',
        agent: this.apiBaseUrl.startsWith('https:') ? this.agent : undefined
      });
      if (res.ok) return true;
      // Fallback: try a lightweight predict call
      const ping = await fetch(`${this.apiBaseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: '' }),
        agent: this.apiBaseUrl.startsWith('https:') ? this.agent : undefined
      });
      return ping.ok;
    } catch {
      return false;
    }
  }
}

export const cvServiceRemote = new CVServiceRemote();


