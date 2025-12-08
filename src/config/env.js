import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  googleScriptUrl: process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxnkwtzBChLwnra6qB_YJ_M5LqLc6mdiKxcm2MRnAjx6TtfApfOTNSEoGPZFmzLPpmYRw/exec',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map(o => o.trim())
};

export default env;