import dotenv from 'dotenv';

dotenv.config();

const toArray = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

export const env = {
  port: process.env.PORT || 3000,

  googleScriptUrl:
    process.env.GOOGLE_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwPsWvJuTaftUmGC985MZVUWubXwWLvtyc4l3gcxVf0R3d9N9_NSXjOhCibL44BAGWGdg/exec',

  allowedOrigins: toArray(
    process.env.ALLOWED_ORIGINS || 'http://localhost:4200'
  )
};

export default env;
