import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Serve static files from web-build
const staticPath = join(__dirname, '..', 'web-build');

app.use((req, res, next) => {
  // Try to serve static files first
  const filePath = join(staticPath, req.path);
  try {
    const stats = require('fs').statSync(filePath);
    if (stats.isFile()) {
      return res.sendFile(filePath);
    }
  } catch (e) {
    // File doesn't exist, continue
  }
  next();
});

// All other routes serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(staticPath, 'index.html'));
});

export default app;
