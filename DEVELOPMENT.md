# SIMISAI Development Guide

A comprehensive guide for setting up and running SIMISAI in development mode across all platforms.

## 🚀 Quick Start

### Option 1: Full Development Environment (Recommended)
```bash
# Start both frontend and backend
pnpm run dev:full
```

### Option 2: Manual Setup
```bash
# Terminal 1: Backend server
pnpm run dev:server

# Terminal 2: Frontend (Astro)
pnpm run dev
```

## 🌐 Access Points

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket Connection**: ws://localhost:3001/chat-ws

## 🏗️ Architecture

SIMISAI uses a modern full-stack architecture:

- **Frontend**: Astro with React components
- **Backend**: Express.js server with TypeScript
- **Computer Vision**: Python service for device detection
- **Database**: PostgreSQL (via Neon)
- **Real-time**: WebSocket for chat functionality

## 📁 Project Structure

```
SIMISAI/
├── src/                    # Astro frontend with React components
│   ├── components/         # React components
│   ├── pages/             # Astro pages
│   ├── layouts/           # Astro layouts
│   └── lib/               # Shared utilities
├── server/                # Backend Express server
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   └── cv-service.ts     # Computer vision service
├── cv_model/             # Python CV models and training
├── shared/               # Shared TypeScript schemas
└── attached_assets/      # Static assets and demo images
```

## 🔧 Development Commands

```bash
# Start full development environment (frontend + backend)
pnpm run dev:full

# Start only backend server
pnpm run dev:server

# Start only frontend (Astro)
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Type checking
pnpm run check

# Database operations
pnpm run db:push
```

## ⚙️ Configuration

### Environment Variables
The development environment automatically sets:
- `NODE_ENV=development`
- `PORT=3001` (Backend)
- `HOST=localhost` (Frontend)

### Port Configuration
- **Backend Server**: Port 3001
- **Frontend Dev Server**: Port 3000
- **HMR (Hot Module Replacement)**: Port 24678 (automatic)

## 🎥 MediaPipe Camera Support

The app includes advanced computer vision capabilities:
- Automatic camera initialization
- Fallback camera selection (back → front → basic)
- Real-time device detection
- Optimized video constraints for development

## 🔍 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

**macOS/Linux:**
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

**Windows:**
```cmd
# Check what's using the ports
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Kill processes if needed
taskkill /PID <PID> /F
```

### Camera Access Issues
- Ensure your browser has camera permissions
- Check that you're accessing via `localhost` and not `127.0.0.1`
- Try refreshing the page if camera doesn't initialize
- For production, camera requires HTTPS

### WebSocket Connection Issues
- Verify the backend is running on port 3001
- Check browser console for connection errors
- Ensure no firewall is blocking localhost connections

### API Connection Issues
- Verify backend server is running
- Check that API endpoints are accessible at http://localhost:3001/api/
- Ensure no CORS issues in browser console

## 🔄 Hot Reload

Both frontend and backend support hot reloading:
- **Frontend**: Astro HMR automatically reloads components
- **Backend**: tsx automatically restarts the server on file changes

## 🌍 Network Access

By default, development servers are bound to `localhost` for security. If you need external network access:

1. Update `astro.config.mjs` server.host to `'0.0.0.0'`
2. Update `server/index.ts` host binding
3. Use your machine's IP address instead of localhost

## 🐍 Python CV Service

The computer vision functionality requires Python dependencies:

```bash
# Navigate to CV model directory
cd cv_model

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## 📝 Development Notes

- The development environment works on macOS, Windows, and Linux
- All services run on localhost for security
- Camera access requires HTTPS in production (not needed for localhost)
- WebSocket connections automatically reconnect on disconnection
- Backend uses port 3001 to avoid conflicts with system services

## 🚀 Production Deployment

For production deployment:

1. Build the application: `pnpm run build`
2. Start the production server: `pnpm run start`
3. Ensure all environment variables are properly set
4. Configure HTTPS for camera access
5. Set up proper database connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Look at the troubleshooting section
3. Check browser console for errors
4. Verify all services are running
5. Create an issue with detailed error information
