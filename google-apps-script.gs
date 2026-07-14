/**
 * KesariX Delivery Club — Recruitment form → Google Sheet
 * Target sheet: https://docs.google.com/spreadsheets/d/1Aeb-iBfD1clp3-YaHjCgJPZ9dyfGVkmyFaKuAAF6Mt4/edit
 *
 * SETUP (one-time, ~3 minutes):
 *   1. Open the sheet above → Extensions → Apps Script.
 *   2. Delete any starter code, paste ALL of this file, Save.
 *   3. Click "Deploy" → "New deployment" → type: "Web app".
 *        - Description:      Delivery Club form
 *        - Execute as:       Me (your account)
 *        - Who has access:   Anyone
 *   4. Click Deploy → Authorize access → allow.
 *   5. Copy the "Web app URL" (ends in /exec).
 *   6. Paste that URL into index.html → SHEET_ENDPOINT.
 *
 * That's it. Every application submitted on the live site is appended
 * as a new row. You can download it any time as Excel (File → Download → .xlsx).
 */

const SHEET_ID   = '1Aeb-iBfD1clp3-YaHjCgJPZ9dyfGVkmyFaKuAAF6Mt4';
const SHEET_NAME = 'Applications';
const HEADERS    = ['Timestamp', 'Full Name', 'Age', 'Contact', 'City', 'Vehicle'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // avoid two submissions writing the same row

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const p = e.parameter || {};
    sheet.appendRow([
      p.timestamp || new Date().toLocaleString('en-IN'),
      p.name    || '',
      p.age     || '',
      "'" + (p.contact || ''), // leading apostrophe keeps the phone number as text
      p.city    || '',
      p.vehicle || ''
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('KesariX Delivery Club recruitment endpoint is live.');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
