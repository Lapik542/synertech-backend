import { sendToGoogleScript } from '../external/googleScriptClient.js';

export async function createLead(lead) {
  if (!lead.name || !lead.email || !lead.phone) {
    const err = new Error('name, email, and phone are required');
    err.statusCode = 400;
    throw err;
  }

  // Тут можна додати логіку:
  // - нормалізація телефона
  // - логування в БД
  // - відправка email/slack нотифікації

  const result = await sendToGoogleScript(lead);

  return {
    success: true,
    providerResponse: result
  };
}
