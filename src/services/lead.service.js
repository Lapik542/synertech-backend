import { sendToGoogleScript } from '../external/googleScriptClient.js';
// import { sendTelegramNotification } from '../external/telegramClient.js';

export async function createLead(lead) {
  if (!lead.name || !lead.email || !lead.phone) {
    const err = new Error('name, email, and phone are required');
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    services: lead.services || '',
    challenge: lead.challenge || '',
    budget: lead.budget || '',
    deadline: lead.deadline || '',
    comments: lead.comments || '',
    status: lead.status || 'New',
    link: lead.link || '',
    utm_source: lead.utm_source || '',
    utm_medium: lead.utm_medium || '',
    utm_campaign: lead.utm_campaign || '',
    utm_term: lead.utm_term || '',
    utm_content: lead.utm_content || '',
  };

  const result = await sendToGoogleScript(payload);
  console.log('Google Sheets: success');

  // try {
  //   const telegramResult = await sendTelegramNotification(payload);
  //   console.log('Telegram notification:', telegramResult);
  // } catch (err) {
  //   console.error('Telegram notification failed:', err);
  // }

  return { success: true, providerResponse: result };
}