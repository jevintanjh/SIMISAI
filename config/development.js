// Development Configuration for macOS Localhost
module.exports = {
  NODE_ENV: 'development',
  PORT: 3001,
  VITE_DEV_SERVER_HOST: 'localhost',
  VITE_DEV_SERVER_PORT: 3000,
  VITE_API_BASE_URL: 'http://localhost:3001',
  VITE_WS_BASE_URL: 'ws://localhost:3001',
  
  // MediaPipe and Camera Settings
  VITE_CAMERA_CONSTRAINTS: {
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { ideal: 30 }
    }
  },
  
  // Development Server Settings
  VITE_DEV_SERVER_HTTPS: false,
  VITE_DEV_SERVER_OPEN: true
};
