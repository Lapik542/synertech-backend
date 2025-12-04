import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import leadRoutes from './routes/lead.routes.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    })
  );
    
  // healthcheck
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API
  app.use('/api/leads', leadRoutes);

  app.get('/', (_req, res) => {
    res.send('Syner Backend is running!');
  });

  // 404 
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
  });

  return app;
}
