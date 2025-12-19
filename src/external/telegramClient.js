import { env } from '../config/env.js';
import { getAllowedChatIds } from './telegramVerification.js';

export async function sendTelegramNotification(lead) {
  if (!env.telegramBotToken) {
    console.warn('Telegram bot token not configured');
    return { success: false, reason: 'not_configured' };
  }

  const chatIds = getAllowedChatIds();
  
  if (chatIds.length === 0) {
    console.warn('No verified users to send notification');
    return { success: false, reason: 'no_verified_users' };
  }

  const message = formatLeadMessage(lead);
  const results = [];

  // Send to all verified users
  for (const chatId of chatIds) {
    try {
      const result = await sendMessageToChatId(chatId, message);
      results.push({ chatId, ...result });
    } catch (err) {
      console.error(`Failed to send to chatId ${chatId}:`, err);
      results.push({ chatId, success: false, error: err.message });
    }
  }

  return { 
    success: results.some(r => r.success), 
    results,
    sentTo: results.filter(r => r.success).length
  };
}

async function sendMessageToChatId(chatId, message) {
  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }

  return { success: true, messageId: data.result.message_id };
}

function formatLeadMessage(lead) {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Kyiv',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `
🔔 <b>New Lead Received!</b>

👤 <b>Name:</b> ${escapeHtml(lead.name)}
📧 <b>Email:</b> ${escapeHtml(lead.email)}

🕐 ${timestamp}
  `.trim();
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}