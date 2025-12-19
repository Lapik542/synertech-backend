import { env } from '../config/env.js';

export async function sendTelegramNotification(lead) {
  if (!env.telegramBotToken || !env.telegramChatId) {
    console.warn('Telegram credentials not configured');
    return { success: false, reason: 'not_configured' };
  }

  const message = formatLeadMessage(lead);
  const url = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: env.telegramChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    return { success: true, messageId: data.result.message_id };
  } catch (err) {
    console.error('Telegram notification error:', err);
    throw err;
  }
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