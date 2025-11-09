# Getting Started with SIMISAI Development

## Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (LTS recommended)
- **pnpm**: v8+ (package manager)
- **Git**: For version control
- **PostgreSQL**: For local database (or Neon Database account)
- **AWS CLI**: For deployment (optional for local development)

### 🚀 Initial Setup

#### 1. Clone Repository
```bash
git clone https://github.com/jevintanjh/SIMISAI.git
cd SIMISAI
```

#### 2. Install Dependencies
```bash
pnpm install
```

#### 3. Environment Configuration
Copy the example environment file and configure:
```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
# Database (choose one)
DATABASE_URL="postgresql://user:pass@localhost:5432/simisai"
# OR use Neon Database
DATABASE_URL="postgresql://user:pass@server.neon.tech/simisai"

# Optional - Computer Vision Service
CV_REMOTE_URL="https://dockercv.onrender.com"
HF_SPACES_URL="https://your-cv-service.hf.space"

# Development
NODE_ENV="development"
```

#### 4. Database Setup
```bash
# Apply database schema
pnpm run db:push

# Verify connection
pnpm run dev:server
```

#### 5. Start Development Environment
```bash
# Start both frontend and backend
pnpm run dev:full

# OR start individually
pnpm run dev:server  # Backend on port 3001
pnpm run dev         # Frontend on port 5000
```

### 🌐 Access Points
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001/chat-ws

## Development Workflow

### Branch Strategy
- **main**: Stable production code
- **CVFix**: Current development branch with latest features
- **feature/***: Feature development branches
- **aws-deployment**: AWS infrastructure and deployment

### Making Changes

#### 1. Create Feature Branch
```bash
git checkout CVFix
git pull origin CVFix
git checkout -b feature/your-feature-name
```

#### 2. Development Process
```bash
# Frontend changes
cd src/
# Edit components, pages, or layouts

# Backend changes
cd server/
# Edit API routes, services, or middleware

# Database changes
cd shared/
# Edit schema.ts, then run: pnpm run db:push
```

#### 3. Testing Your Changes
```bash
# Type checking
pnpm run check

# Build verification
pnpm run build

# Start production build locally
pnpm run start
```

#### 4. Commit and Push
```bash
git add .
git commit -m "feat: your descriptive commit message"
git push origin feature/your-feature-name
```

## Project Structure Deep Dive

### Frontend Structure (`/src/`)
```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   ├── pages/              # Page-specific components
│   └── ...                 # Feature components
├── pages/                  # Astro pages (routing)
├── layouts/                # Page layouts
├── hooks/                  # React custom hooks
└── lib/                    # Utilities and helpers
```

### Backend Structure (`/server/`)
```
server/
├── index.ts               # Express server entry point
├── routes.ts              # API routes and WebSocket
├── storage.ts             # Database layer (Drizzle ORM)
├── cv-service*.ts         # Computer vision services
└── static.ts              # Static file serving
```

### Shared Structure (`/shared/`)
```
shared/
└── schema.ts              # Drizzle database schema
```

## Common Development Tasks

### Adding a New API Endpoint
1. **Define Route** in `server/routes.ts`:
```typescript
app.get('/api/new-endpoint', async (req, res) => {
  // Implementation
  res.json({ success: true });
});
```

2. **Add Database Operations** in `server/storage.ts`:
```typescript
export async function getNewData() {
  return await db.select().from(newTable);
}
```

3. **Update Frontend** to use the endpoint:
```typescript
// In React component
const { data } = useQuery({
  queryKey: ['new-data'],
  queryFn: () => fetch('/api/new-endpoint').then(r => r.json())
});
```

### Adding a New Database Table
1. **Define Schema** in `shared/schema.ts`:
```typescript
export const newTable = pgTable('new_table', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

2. **Apply Changes**:
```bash
pnpm run db:push
```

3. **Use in Code**:
```typescript
import { newTable } from '../shared/schema';
import { db } from './storage';

const results = await db.select().from(newTable);
```

### Adding a New React Component
1. **Create Component** in appropriate directory:
```typescript
// src/components/NewComponent.tsx
import { FC } from 'react';

interface Props {
  title: string;
}

export const NewComponent: FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

2. **Export from Index** if needed:
```typescript
// src/components/index.ts
export { NewComponent } from './NewComponent';
```

3. **Use in Pages**:
```astro
---
// src/pages/example.astro
import { NewComponent } from '../components/NewComponent';
---
<NewComponent title="Hello World" />
```

## Debugging and Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using port 3001 or 5000
lsof -i :3001
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Reset database schema
pnpm run db:push
```

#### Frontend Build Issues
```bash
# Clear Astro cache
rm -rf .astro/
pnpm run dev
```

#### TypeScript Errors
```bash
# Run type checking
pnpm run check

# Restart TypeScript server in VSCode
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### Development Tools

#### Recommended VSCode Extensions
- **Astro**: Astro language support
- **TypeScript Importer**: Auto import management
- **Tailwind CSS IntelliSense**: CSS class autocomplete
- **Prettier**: Code formatting
- **ESLint**: Code linting

#### Browser Development Tools
- **React Developer Tools**: Component inspection
- **Astro Developer Toolbar**: Built-in debugging tools
- **Network Tab**: API request monitoring
- **Console**: Error tracking and debugging

## Testing Guidelines

### Manual Testing Checklist
- [ ] Frontend loads correctly on localhost:5000
- [ ] Backend responds to API calls on localhost:3001
- [ ] WebSocket chat connection works
- [ ] Computer vision detection (if CV service configured)
- [ ] Database operations succeed
- [ ] Multi-language switching functions
- [ ] Mobile responsive design works

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/status

# Test device listing
curl http://localhost:3001/api/devices

# Test chat endpoint
curl -X POST http://localhost:3001/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","question":"Hello","language":"en"}'
```

## Deployment Preview

### Local Production Build
```bash
# Build for production
pnpm run build

# Start production server
pnpm run start
```

### AWS Deployment (Advanced)
See [AWS Infrastructure Documentation](../deployment/aws-infrastructure.md) for deployment procedures.

## Getting Help

### Documentation Resources
- **[System Overview](../architecture/system-overview.md)**: High-level architecture
- **[API Reference](../api/endpoints.md)**: Complete API documentation
- **[AWS Infrastructure](../deployment/aws-infrastructure.md)**: Deployment details

### Development Community
- **GitHub Issues**: Report bugs or request features
- **Code Reviews**: Submit pull requests for feedback
- **Documentation**: Update docs when adding features

### AI Assistants Available
- **Claude Code**: Primary development assistant (architecture, documentation)
- **OpenCode + Grok**: Secondary coding assistant ([Setup Guide](opencode-setup.md))
- **Gemini CLI**: Alternative AI perspective for specialized tasks

---

**Next Steps**:
1. Complete the initial setup above
2. Set up [OpenCode CLI with Grok](opencode-setup.md) for additional AI assistance
3. Review [Coding Guidelines](coding-guidelines.md)
4. Explore [API Reference](../api/endpoints.md)
5. Check [Architecture Overview](../architecture/system-overview.md)

**Need Help?** Check [Troubleshooting](../deployment/troubleshooting.md) or use the AI assistants.