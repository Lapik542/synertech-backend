import { google } from 'googleapis';
import { env } from '../config/env.js';

const SPREADSHEET_ID = '10FAf177fQMwuooVMmLCqVIUIK128nHsA5sQQ3MUxNtU';
const SHEET_NAME = 'Sheet1';

function getAuth() {
  const credentials = env.googleCredentials;
  if (!credentials) {
    throw new Error('GOOGLE_CREDENTIALS env variable is not set');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const HEADERS = ['Date', 'Name', 'Email', 'Phone', 'Message'];

export async function appendLeadToSheet(lead) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Check if headers exist, add them if sheet is empty
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
  });

  const rows = [];
  if (!existing.data.values) {
    rows.push(HEADERS);
  }

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  rows.push([
    now,
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.message || '',
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:E`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  console.log('Google Sheets (direct): lead appended');
}
