import { env } from '../config/env.js';
import { 
  isPhoneAllowed, 
  registerUserChatId,
  sendTelegramMessage,
  TELEGRAM_CONFIG,
  loadVerifiedUsers
} from './telegramVerification.js';

let botInitialized = false;
const processedMessages = new Set();
const verificationInProgress = new Map();

export function initTelegramBot() {
  if (botInitialized) return;

  botInitialized = true;

  loadVerifiedUsers();

  console.log('Telegram bot initialized');
  console.log('Allowed phones:', TELEGRAM_CONFIG.allowedPhones);

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
    }
  }
}

async function handleUpdate(update) {
  try {
    if (update.message) {
      const messageId = `${update.message.chat.id}_${update.message.message_id}`;
      
      console.log(`🔍 Processing update_id: ${update.update_id}, message_id: ${messageId}`);
      
      // Skip if already processed
      if (processedMessages.has(messageId)) {
        console.log(`⏭️ Already processed: ${messageId}`);
        return;
      }
      
      processedMessages.add(messageId);
      console.log(`✅ Marked as processed: ${messageId}`);
      
      // Clean up old messages (keep last 100)
      if (processedMessages.size > 100) {
        const arr = Array.from(processedMessages);
        processedMessages.clear();
        arr.slice(-50).forEach(id => processedMessages.add(id));
      }
      
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }
  } catch (err) {
    console.error('Error handling update:', err);
  }
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  console.log(`📨 Message from ${chatId}: ${text || '[contact/media]'}`);
  
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
  const verificationKey = `${chatId}_${phone}`;
  
  console.log(`📱 Contact shared from ${chatId}: ${phone}`);
  
  // Check if verification is already in progress
  if (verificationInProgress.has(verificationKey)) {
    console.log(`⏭️ Verification already in progress for ${verificationKey}`);
    return;
  }
  
  // Mark verification as in progress
  verificationInProgress.set(verificationKey, true);
  
  try {
    if (isPhoneAllowed(phone)) {
      registerUserChatId(phone, chatId);
      
      await sendTelegramMessage(chatId, 
        '✅ <b>Access Granted!</b>\n\n' +
        'You will now receive lead notifications from Synertech.',
        { reply_markup: { remove_keyboard: true } }
      );
      
      console.log(`✅ Sent access granted to ${chatId}`);
    } else {
      await sendTelegramMessage(chatId, 
        '❌ <b>Access Denied</b>\n\n' +
        'Your phone number is not authorized.\n' +
        `Please contact the administrator:\n📞 ${TELEGRAM_CONFIG.adminPhone}`,
        { reply_markup: { remove_keyboard: true } }
      );
      
      console.log(`❌ Sent access denied to ${chatId}`);
    }
  } finally {
    // Remove from in-progress after a delay to prevent rapid duplicates
    setTimeout(() => {
      verificationInProgress.delete(verificationKey);
      console.log(`🗑️ Cleared verification lock for ${verificationKey}`);
    }, 5000);
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