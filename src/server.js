import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const port = Number(process.env.PORT) || Number(env.port) || 3000;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`);
  console.log('ALLOWED_ORIGINS:', env.allowedOrigins);
});
