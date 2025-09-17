/**
 * API Configuration for Production
 */

const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('cloudfront.net') || 
   window.location.hostname.includes('amazonaws.com'));

export const API_CONFIG = {
  // Base URL for API calls
  baseUrl: isProduction 
    ? 'https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod'
    : 'http://localhost:3001',
  
  // WebSocket URL for real-time chat
  wsUrl: isProduction
    ? 'wss://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat-ws'
    : 'ws://localhost:3001/chat-ws',
  
  // Chat API endpoint
  chatEndpoint: isProduction
    ? 'https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/chat'
    : 'http://localhost:3001/api/chat/ask',
  
  // Status API endpoint
  statusEndpoint: isProduction
    ? 'https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod/status'
    : 'http://localhost:3001/api/status',
  
  // Mock data for devices (since we don't have a full backend yet)
  mockDevices: [
    {
      id: 'thermometer-001',
      name: 'Digital Thermometer',
      type: 'thermometer',
      brand: 'Generic',
      model: 'DT-100',
      description: 'Digital thermometer for oral, rectal, and axillary temperature measurement'
    },
    {
      id: 'bp-monitor-001',
      name: 'Blood Pressure Monitor',
      type: 'blood_pressure',
      brand: 'Generic',
      model: 'BP-200',
      description: 'Automatic blood pressure monitor with digital display'
    },
    {
      id: 'glucose-meter-001',
      name: 'Glucose Meter',
      type: 'glucose',
      brand: 'Generic',
      model: 'GM-300',
      description: 'Blood glucose monitoring device'
    }
  ],
  
  // Mock instructions for thermometer
  mockInstructions: {
    'thermometer-001': [
      {
        id: 1,
        stepNumber: 1,
        title: 'Prepare the Thermometer',
        description: 'Clean the thermometer with alcohol and ensure it\'s dry before use.',
        imageUrl: '/Demo 1.jpg',
        estimatedTime: '30 seconds'
      },
      {
        id: 2,
        stepNumber: 2,
        title: 'Position Correctly',
        description: 'Place the thermometer under your tongue or in your armpit. Keep your mouth closed.',
        imageUrl: '/Demo 2.jpg',
        estimatedTime: '1 minute'
      },
      {
        id: 3,
        stepNumber: 3,
        title: 'Wait for Reading',
        description: 'Hold the thermometer in place until you hear a beep sound indicating the reading is complete.',
        imageUrl: '/Demo 3.jpg',
        estimatedTime: '30 seconds'
      },
      {
        id: 4,
        stepNumber: 4,
        title: 'Read Temperature',
        description: 'Read the temperature display. Normal body temperature is 98.6°F (37°C).',
        imageUrl: '/Demo 4.jpg',
        estimatedTime: '10 seconds'
      }
    ]
  }
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

// Helper function to get WebSocket URL
export function getWsUrl(): string {
  return API_CONFIG.wsUrl;
}

// Helper function to check if we're in production
export function isProductionEnvironment(): boolean {
  return isProduction;
}







