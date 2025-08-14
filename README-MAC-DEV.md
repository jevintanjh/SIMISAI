# SIMISAI macOS Localhost Development Guide

This guide explains how to set up and run SIMISAI for localhost development on macOS.

## 🚀 Quick Start

### Option 1: Using the Development Script (Recommended)
```bash
# Make the script executable (first time only)
chmod +x scripts/dev-mac.sh

# Run the development environment
./scripts/dev-mac.sh
```

### Option 2: Manual Setup
```bash
# Terminal 1: Start the backend server
NODE_ENV=development PORT=3001 npm run dev

# Terminal 2: Start the Vite dev server
npm run dev:vite
```

## 🌐 Access Points

Once running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket Connection**: ws://localhost:3001/chat-ws

## 🔧 Configuration

### Environment Variables
The development environment automatically sets:
- `NODE_ENV=development`
- `PORT=3001` (Backend)
- `VITE_DEV_SERVER_PORT=3000` (Frontend)
- `VITE_DEV_SERVER_HOST=localhost`

### Port Configuration
- **Backend Server**: Port 3001 (avoiding macOS system service conflicts)
- **Frontend Dev Server**: Port 3000
- **HMR (Hot Module Replacement)**: Port 24678

## 📱 MediaPipe Camera Support

The MediaPipe camera hook has been configured to work with macOS localhost:
- Automatic camera initialization
- Fallback camera selection (back → front → basic)
- Optimized video constraints for development

## 🔍 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
# Check what's using the ports
lsof -i :3001
lsof -i :3000

# Kill processes if needed
kill -9 <PID>
```

### Camera Access Issues
- Ensure your browser has camera permissions
- Check that you're accessing via `localhost` and not `127.0.0.1`
- Try refreshing the page if camera doesn't initialize

### WebSocket Connection Issues
- Verify the backend is running on port 3001
- Check browser console for connection errors
- Ensure no firewall is blocking localhost connections

## 🛠️ Development Commands

```bash
# Start full development environment
npm run dev:full

# Start only backend
npm run dev:mac

# Start only frontend
npm run dev:vite

# Build for production
npm run build

# Type checking
npm run check
```

## 📁 File Structure

```
SIMISAI/
├── client/                 # Frontend React app
├── server/                 # Backend Express server
├── scripts/
│   └── dev-mac.sh        # macOS development script
├── config/
│   └── development.js    # Development configuration
└── README-MAC-DEV.md     # This file
```

## 🔄 Hot Reload

Both frontend and backend support hot reloading:
- **Frontend**: Vite HMR automatically reloads React components
- **Backend**: tsx automatically restarts the server on file changes

## 🌍 Network Access

By default, the development servers are bound to `localhost` for security. If you need external network access:

1. Update `vite.config.ts` server.host to `'0.0.0.0'`
2. Update `server/index.ts` host binding
3. Use your machine's IP address instead of localhost

## 📝 Notes

- The development environment is optimized for macOS
- All services run on localhost for security
- Camera access requires HTTPS in production (not needed for localhost)
- WebSocket connections automatically reconnect on disconnection
- Backend uses port 3001 to avoid conflicts with macOS system services
