import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from the dist directory
  app.use(express.static(distPath));

  // Handle specific routes that should serve static HTML files
  app.get('/how-it-works', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'how-it-works', 'index.html'));
  });

  app.get('/how-it-works/', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'how-it-works', 'index.html'));
  });

  app.get('/welcome-static', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'welcome-static', 'index.html'));
  });

  app.get('/welcome-static/', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'welcome-static', 'index.html'));
  });

  // fall through to index.html for all other routes (SPA behavior)
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
