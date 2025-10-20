# Multi-stage build for SIMISAI Application
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (both frontend and backend)
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S simisai -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from base stage
COPY --from=base --chown=simisai:nodejs /app/dist ./dist
COPY --from=base --chown=simisai:nodejs /app/server ./server
COPY --from=base --chown=simisai:nodejs /app/shared ./shared

# Copy necessary files
COPY --chown=simisai:nodejs astro.config.mjs ./
COPY --chown=simisai:nodejs tsconfig.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown simisai:nodejs /app/logs

# Switch to non-root user
USER simisai

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/status', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["pnpm", "start"]