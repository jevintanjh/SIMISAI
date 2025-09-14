# Developer Setup Guide

## Quick Start for New Developers

### 1. Environment Setup

Create a `.env` file in the project root with the following configuration:

```bash
# Node environment
NODE_ENV=development

# Server port
PORT=3001

# AWS CV Service Configuration
# Connect to shared AWS EC2 instance for computer vision inference
# Contact Raymond Harrison for the actual CV_REMOTE_URL value
CV_REMOTE_URL=http://YOUR_TEAM_AWS_CV_SERVICE_URL:5000

# Database and other configurations (add as needed)
# DATABASE_URL=your_database_url_here
# SEALION_API_KEY=your_sealion_api_key_here
# SEALION_API_URL=your_sealion_api_url_here
# SESSION_SECRET=your_session_secret_here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

⚠️ **IMPORTANT**: Use the full-stack development command, NOT the regular `npm run dev`

```bash
# ✅ CORRECT - Runs both frontend and backend
npm run dev:full

# ❌ WRONG - Only runs frontend (Astro), missing API endpoints
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001/chat-ws

## Why `dev:full` Instead of `dev`?

This project uses a **hybrid architecture**:

- **Frontend**: Astro framework (port 3000)
- **Backend**: Express.js server with API routes (port 3001)

| Command | What it does | Result |
|---------|--------------|--------|
| `npm run dev` | Only starts Astro frontend | ❌ API calls return 404 |
| `npm run dev:full` | Starts both Astro + Express | ✅ Full functionality |

## Architecture Overview

```
┌─────────────────┐    Proxy     ┌──────────────────┐
│  Astro Frontend │ ───────────→ │ Express Backend  │
│   Port 3000     │   /api/*     │   Port 3001      │
└─────────────────┘              └──────────────────┘
                                          │
                                          ▼
                                  ┌──────────────────┐
                                  │   AWS CV Service │
                                  │ 54.212.12.203    │
                                  └──────────────────┘
```

## Computer Vision Service

The app automatically uses the shared AWS CV service for all team members:
- **Service**: Contact team lead for AWS CV service URL
- **Purpose**: Thermometer detection for medical device guidance
- **Performance**: ~2-5 seconds per detection
- **Status**: Check at `{CV_REMOTE_URL}/health` endpoint

## Development Commands

```bash
# Start full development environment
npm run dev:full

# Start only backend server
npm run dev:server

# Start only frontend (Astro)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check
```

## Troubleshooting

### Problem: API calls return 404
**Solution**: Make sure you're using `npm run dev:full`, not `npm run dev`

### Problem: Camera screen is blank
**Cause**: Frontend can't reach backend API endpoints
**Solution**: Restart with `npm run dev:full` and check console for errors

### Problem: CV detection not working
**Cause**: AWS service might be down or misconfigured
**Solution**:
1. Check AWS service: `curl $CV_REMOTE_URL/health`
2. Verify `.env` has correct `CV_REMOTE_URL` from team lead

### Problem: TypeScript errors
**Solution**: Run `npm run check` to see type issues

## Project Structure

```
SIMISAI/
├── src/                    # Astro frontend source
│   ├── components/         # React components
│   ├── pages/             # Astro pages
│   └── hooks/             # React hooks
├── server/                # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── cv-service*.ts     # CV service integrations
├── shared/                # Shared types/schemas
├── .env                   # Environment configuration
├── astro.config.mjs       # Astro configuration
└── package.json           # Dependencies and scripts
```

## Environment Variables Explained

- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Backend server port (3001)
- `CV_REMOTE_URL`: AWS CV service endpoint (shared team resource)

## Team Workflow

1. **Clone repo** and run `npm install`
2. **Create `.env`** with the configuration above
3. **Always use** `npm run dev:full` for development
4. **Frontend development**: Work in `src/` directory
5. **Backend development**: Work in `server/` directory
6. **Shared types**: Update in `shared/` directory

## Production Deployment

The app builds to a single Express server that serves both frontend and API:

```bash
npm run build  # Builds frontend + backend
npm start      # Runs production server
```

## Need Help?

- Check the console logs when running `npm run dev:full`
- Verify AWS CV service is healthy: http://54.212.12.203:5000/health
- Ensure `.env` file exists with correct `CV_REMOTE_URL`
- Use browser dev tools to check for API call errors