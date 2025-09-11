import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // In development, Astro handles the frontend
    // In production, serve static files
    if (app.get("env") !== "development") {
      serveStatic(app);
    }

    // Bind to all interfaces in development to avoid IPv4/IPv6 localhost issues on Windows
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.NODE_ENV === 'development' ? '0.0.0.0' : '0.0.0.0';
    
    // Start the server
    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`✅ Server running on ${host}:${port}`);
      if (process.env.NODE_ENV === 'development') {
        log(`🌐 Local development server accessible at http://localhost:${port}`);
        log(`🔧 API endpoints available at http://localhost:${port}/api`);
        log(`💬 WebSocket available at ws://localhost:${port}/chat-ws`);
      }
    });

    // Handle server errors gracefully
    server.on('error', (err: any) => {
      if ((err as any).code === 'EADDRINUSE') {
        log(`❌ Port ${port} is already in use. Please try a different port.`);
      } else if ((err as any).code === 'ENOTSUP') {
        log(`❌ Socket operation not supported. Trying alternative configuration...`);
        // Try binding without reusePort
        server.listen({
          port,
          host,
          reusePort: false,
        }, () => {
          log(`✅ Server running on ${host}:${port} (without reusePort)`);
        });
      } else {
        log(`❌ Server error: ${err.message}`);
      }
    });

  } catch (error) {
    log(`❌ Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
})();
