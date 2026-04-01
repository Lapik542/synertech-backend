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
    'https://script.google.com/macros/s/AKfycbwb3IGvra4QBkn975I4R18vRM0jT-m4NCzTJcMWHDCuO8NBiEvtcMkmAQ4AiNmFAFLkrw/exec',

  allowedOrigins: toArray(
    process.env.ALLOWED_ORIGINS || 'http://localhost:4200'
  ),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '7578959430:AAGeQFnaGoUjANs-VYnlyavI_tneytwB0C4',

  googleCredentials: process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : null,
};

export default env;