import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './API/routes.js';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env parameters
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow any origin in dev mode
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Routes
app.use('/api', apiRouter);

// Serve Frontend build folder if it exists
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
  console.log(`Serving static production frontend from: ${frontendBuildPath}`);
} else {
  // If not built yet, return informative message for index requests in dev mode
  app.get('/', (req, res) => {
    res.send('Video Analytics Tracker API is running. Build the frontend or run frontend dev server to view the interface.');
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Backend server running on http://localhost:${PORT}`);
  console.log(`===============================================`);
});
