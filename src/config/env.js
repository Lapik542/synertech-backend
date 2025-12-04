import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwESIt5I576ndnKPrW4nOzAP4nvMjfaeRLXsx0NYcGW8r1VhLLN5ToUf3yNk-V5aDS6iA/exec',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map(o => o.trim())
};

export default env;