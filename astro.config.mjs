import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      // Apply Tailwind to all files in the project
      applyBaseStyles: false,
    }),
    icon(),
  ],
  // Configure the build output
  build: {
    outDir: './dist',
  },
  // Configure the dev server
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // Configure Vite for compatibility with existing setup
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@shared': path.resolve('./shared'),
        '@assets': path.resolve('./attached_assets'),
      },
    },
    optimizeDeps: {
      // Exclude problematic dependencies from pre-bundling
      exclude: [
        '@mediapipe/tasks-vision',
        'ws',
        'bufferutil'
      ],
      // Force re-optimization of dependencies
      force: true
    },
    // Clear cache on startup to prevent stale chunk references
    clearScreen: false,
    server: {
      // Proxy removed - using production AWS endpoints directly
      // Ensure proper dependency resolution
      fs: {
        strict: false
      }
    }
  },
  // Configure the public directory
  publicDir: './attached_assets',
});
