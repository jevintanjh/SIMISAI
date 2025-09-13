import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import icon from 'astro-icon';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    outDir: './dist/public',
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
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './shared'),
        '@assets': path.resolve(__dirname, './attached_assets'),
      },
    },
  },
  // Configure the public directory
  publicDir: './attached_assets',
});
