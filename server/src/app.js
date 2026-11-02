import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import caseRoutes from './routes/caseRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

dotenv.config();

export const app = express();

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientOrigin,
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', caseRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Central Error Handler
app.use(errorHandler);

// Server entry point when run directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[Server] AI Mystery Room backend listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[Server] Failed to connect to DB, exiting:', err.message);
      process.exit(1);
    });
}

