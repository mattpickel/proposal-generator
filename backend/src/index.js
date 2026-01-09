/**
 * Backend API Server
 * Exposes backend services as REST API endpoints
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Import route handlers
import databaseRoutes from './routes/database.js';
import extractionRoutes from './routes/extraction.js';
import generationRoutes from './routes/generation.js';
import proposalsV2Routes from './routes/proposals.js';
import ghlRoutes from './routes/ghl.js';

// Routes
app.use('/api/database', databaseRoutes);
app.use('/api/extraction', extractionRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/proposals', proposalsV2Routes);
app.use('/api/ghl', ghlRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend API server running on http://localhost:${PORT}`);
});

