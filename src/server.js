import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import leadRoutes from './routes/lead.routes.js';
import { initTelegramBot } from './external/telegramBot.js';

const app = express();

// Middleware
app.use(cors({
  origin: env.allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', leadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(env.port, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${env.port}`);
  
  // Initialize Telegram bot
  initTelegramBot();
});