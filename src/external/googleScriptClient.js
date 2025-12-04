import { env } from '../config/env.js';

function toFormBody(data) {
  return Object.entries(data)
    .map(
      ([key, value]) =>
        encodeURIComponent(key) + '=' + encodeURIComponent(value ?? '')
    )
    .join('&');
}

export async function sendToGoogleScript(payload) {
  const body = toFormBody(payload);

  const response = await fetch(env.googleScriptUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Google Script error: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
