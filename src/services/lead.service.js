import { sendToGoogleScript } from '../external/googleScriptClient.js';
import { sendTelegramNotification } from '../external/telegramClient.js';

export async function createLead(lead) {
  if (!lead.name || !lead.email || !lead.phone) {
    const err = new Error('name, email, and phone are required');
    err.statusCode = 400;
    throw err;
  }

  // Normalize phone
  lead.phone = normalizePhone(lead.phone);

  // 1. Send to Google Sheets first
  const result = await sendToGoogleScript(lead);
  console.log('Google Sheets: success');

  // 2. Send Telegram notification after successful Google Sheets submission
  try {
    const telegramResult = await sendTelegramNotification(lead);
    console.log('Telegram notification:', telegramResult);
  } catch (err) {
    console.error('Telegram notification failed:', err);
    // Don't throw - Google Sheets already saved
  }

  return {
    success: true,
    providerResponse: result
  };
}

function normalizePhone(phone) {
  // Remove all characters except digits and +
  return phone.replace(/[^\d+]/g, '');
}