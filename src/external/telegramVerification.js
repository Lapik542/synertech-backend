import { env } from '../config/env.js';

// Allowed phone numbers with their chat IDs
const allowedUsers = new Map();

// Admin and allowed phones configuration
export const TELEGRAM_CONFIG = {
  adminPhone: '0663309198',
  allowedPhones: [
    '0663309198',
    '0637297407',
    '0636561274',
  ]
};

export function isPhoneAllowed(phone) {
  const normalizedPhone = normalizePhone(phone);
  return TELEGRAM_CONFIG.allowedPhones.some(
    allowedPhone => normalizePhone(allowedPhone) === normalizedPhone
  );
}

export function registerUserChatId(phone, chatId) {
  const normalizedPhone = normalizePhone(phone);
  allowedUsers.set(normalizedPhone, chatId.toString());
  console.log(`Registered user: ${normalizedPhone} -> chatId: ${chatId}`);
}

export function getAllowedChatIds() {
  return Array.from(allowedUsers.values());
}

export function normalizePhone(phone) {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Handle Ukrainian numbers
  if (digits.startsWith('380')) {
    digits = '0' + digits.slice(3);
  } else if (digits.startsWith('0') && digits.length === 10) {
    // Already in correct format
  } else if (digits.length === 9) {
    digits = '0' + digits;
  }
  
  return digits;
}

export async function sendTelegramMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    return { success: true, result: data.result };
  } catch (err) {
    console.error('Telegram send message error:', err);
    throw err;
  }
}