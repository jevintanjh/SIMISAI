#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const distDir = 'dist';

// Find all index.html files in subdirectories
function findIndexFiles(dir) {
  const indexFiles = [];

  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (item === 'index.html' && currentDir !== distDir) {
        // Found index.html in a subdirectory
        const relativePath = path.relative(distDir, currentDir);
        indexFiles.push(relativePath);
      }
    }
  }

  searchDir(dir);
  return indexFiles;
}

// Create redirects for CloudFront/S3 compatibility
function createRedirects() {
  const indexFiles = findIndexFiles(distDir);

  console.log('📁 Found subdirectories with index.html:', indexFiles);

  // For each subdirectory, ensure proper routing
  for (const subdir of indexFiles) {
    const subdirPath = path.join(distDir, subdir);
    const indexPath = path.join(subdirPath, 'index.html');

    // Read the index.html content
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');

      // Also create a file without trailing slash for direct access
      const directPath = path.join(distDir, subdir.replace('/', ''));
      if (!fs.existsSync(directPath)) {
        console.log(`🔗 Creating direct access file: ${directPath}`);
        fs.writeFileSync(directPath, content);
      }
    }
  }

  console.log('✅ Post-build routing setup complete!');
}

// Run the script
try {
  createRedirects();
} catch (error) {
  console.error('❌ Post-build script failed:', error);
  process.exit(1);
}