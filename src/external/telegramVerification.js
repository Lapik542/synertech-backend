import { env } from '../config/env.js';
import fs from 'fs';
import path from 'path';

const allowedUsers = new Map();

// файл для збереження (локально)
const STORE_PATH = path.resolve(process.cwd(), 'verified-telegram-users.json');

export const TELEGRAM_CONFIG = {
  adminPhone: '0663309198',
  allowedPhones: ['0663309198']
};

export function normalizePhone(phone) {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('380')) digits = '0' + digits.slice(3);
  else if (digits.length === 9) digits = '0' + digits;

  return digits;
}

export function isPhoneAllowed(phone) {
  const normalizedPhone = normalizePhone(phone);
  return TELEGRAM_CONFIG.allowedPhones.some(
    allowedPhone => normalizePhone(allowedPhone) === normalizedPhone
  );
}

// ---- load/save ----
export function loadVerifiedUsers() {
  try {
    if (!fs.existsSync(STORE_PATH)) return;

    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const obj = JSON.parse(raw);

    allowedUsers.clear();
    for (const [phone, chatId] of Object.entries(obj)) {
      allowedUsers.set(phone, String(chatId));
    }

    console.log(`✅ Loaded verified users: ${allowedUsers.size}`);
  } catch (e) {
    console.error('❌ Failed to load verified users:', e);
  }
}

function saveVerifiedUsers() {
  try {
    const obj = Object.fromEntries(allowedUsers.entries());
    fs.writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Failed to save verified users:', e);
  }
}

export function registerUserChatId(phone, chatId) {
  const normalizedPhone = normalizePhone(phone);
  allowedUsers.set(normalizedPhone, chatId.toString());
  saveVerifiedUsers();
  console.log(`Registered user: ${normalizedPhone} -> chatId: ${chatId}`);
}

export function getAllowedChatIds() {
  return Array.from(allowedUsers.values());
}

export async function sendTelegramMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.description || 'Telegram API error');
  return { success: true, result: data.result };
}
