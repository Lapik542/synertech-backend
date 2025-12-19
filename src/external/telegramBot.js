import { env } from '../config/env.js';
import { 
  isPhoneAllowed, 
  registerUserChatId,
  sendTelegramMessage,
  TELEGRAM_CONFIG
} from './telegramVerification.js';

let botInitialized = false;

export function initTelegramBot() {
  if (botInitialized) return;
  
  botInitialized = true;
  console.log('Telegram bot initialized');
  console.log('Allowed phones:', TELEGRAM_CONFIG.allowedPhones);
  
  // Poll for updates
  pollUpdates();
}

async function pollUpdates() {
  let offset = 0;
  
  while (true) {
    try {
      const url = `https://api.telegram.org/bot${env.telegramBotToken}/getUpdates?offset=${offset}&timeout=30`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          await handleUpdate(update);
          offset = update.update_id + 1;
        }
      }
    } catch (err) {
      console.error('Telegram polling error:', err);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function handleUpdate(update) {
  if (update.message) {
    await handleMessage(update.message);
  } else if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  // Handle /start command
  if (text === '/start') {
    await sendTelegramMessage(chatId, 
      '👋 Welcome to Synertech Lead Notifications!\n\n' +
      'Please share your phone number to verify access.',
      {
        reply_markup: {
          keyboard: [[{
            text: '📱 Share Phone Number',
            request_contact: true
          }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );
    return;
  }
  
  // Handle contact sharing
  if (message.contact) {
    await handleContactShared(chatId, message.contact);
    return;
  }
  
  // Default response
  await sendTelegramMessage(chatId, 
    'Please use /start to begin verification.'
  );
}

async function handleContactShared(chatId, contact) {
  const phone = contact.phone_number;
  
  if (isPhoneAllowed(phone)) {
    registerUserChatId(phone, chatId);
    
    await sendTelegramMessage(chatId, 
      '✅ <b>Access Granted!</b>\n\n' +
      'You will now receive lead notifications from Synertech.',
      { reply_markup: { remove_keyboard: true } }
    );
  } else {
    await sendTelegramMessage(chatId, 
      '❌ <b>Access Denied</b>\n\n' +
      'Your phone number is not authorized.\n' +
      `Please contact the administrator:\n📞 ${TELEGRAM_CONFIG.adminPhone}`,
      { reply_markup: { remove_keyboard: true } }
    );
  }
}

async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  
  // Answer callback query
  await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQuery.id })
  });
}