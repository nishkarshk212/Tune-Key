import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import plansRoutes from './routes/plans.js';
import adminRoutes from './routes/admin.js';
import ytProxyRoutes from './routes/ytProxy.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for debugging & audits
app.use((req, res, next) => {
  if (!req.path.startsWith('/assets')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/yt', ytProxyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'TuneKey YouTube API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve frontend static build if in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('TuneKey Backend API Server is running. In development, open Vite on http://localhost:5173');
    }
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 TuneKey YouTube API Server running on http://localhost:${PORT}`);
    console.log(`📡 Bot Gateway live at http://localhost:${PORT}/api/v1/yt`);
  });
}

export default app;
