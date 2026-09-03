/**
 * RSVP & Wishes Backend - Google Apps Script
 * ==========================================
 * Deploy this file as a Web App to receive/store RSVP entries
 * in a Google Sheet and to serve the live wishes/doa board.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet (sheets.new), rename the first sheet to "Data".
 *    Put these headers in row 1:  Timestamp | Nama | Kehadiran | Pesan
 * 2. Open Extensions -> Apps Script.
 * 3. Delete any default code, paste this entire file, save.
 * 4. Deploy -> New deployment -> Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web App URL and set it as RSVP_API_URL in js/app.js
 * 6. Your website will now store RSVP in the sheet and load real wishes.
 */

const SHEET_NAME = 'Data';

function buildSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Nama', 'Kehadiran', 'Pesan']);
  }
  return sheet;
}

function doGet(e) {
  const sheet = buildSheet_();
  const values = sheet.getDataRange().getValues();

  // Skip header row
  const wishes = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const timestamp = row[0] || '';
    const name = (row[1] || '').toString();
    const status = (row[2] || '').toString();
    const message = (row[3] || '').toString();
    if (!name && !message) continue;

    wishes.unshift({
      name: name,
      status: status === 'Hadir' ? 'Hadir' : 'Berhalangan',
      message: message,
      time: formatTime_(timestamp)
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, wishes: wishes }))
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const sheet = buildSheet_();
  const body = JSON.parse(e.postData.contents);

  const name = clean_(body.name);
  const message = clean_(body.message);
  const status = body.status === 'Berhalangan' ? 'Berhalangan' : 'Hadir';

  if (!name || !message) {
    return json_({ ok: false, error: 'Nama dan pesan wajib diisi.' }, 400);
  }

  const timestamp = new Date();
  sheet.appendRow([timestamp, name, status, message]);

  return json_({
    ok: true,
    wish: {
      name: name,
      status: status,
      message: message,
      time: 'Baru saja'
    }
  });
}

function clean_(str) {
  if (str == null) return '';
  let s = String(str).trim();
  // Prevent spreadsheet formula injection (CSV/DataOnly formula attacks)
  if (/^[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  return s;
}

function formatTime_(ts) {
  if (!ts) return 'Baru saja';
  if (typeof ts === 'string') return ts;
  const now = new Date();
  const diff = Math.max(0, Math.floor((now - ts) / 1000));
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return Math.floor(diff / 60) + ' menit yang lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam yang lalu';
  return Math.floor(diff / 86400) + ' hari yang lalu';
}

function json_(obj) {
  // TEXT MIME (not JSON) so browsers can read the response cross-origin
  // without hitting CORS/preflight restrictions.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.TEXT);
}
