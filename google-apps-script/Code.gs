const SPREADSHEET_ID = '1McJ10dHwUILiDzCSldZYLEWBfC3Vaf4uYEqz5cmf0p8';
const SHEET_NAME = 'Contacts';

function doPost(e) {
  try {
    const p = e.parameter || {};
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted At', 'Full Name', 'Email', 'Country', 'Mobile', 'Message']);
    }

    sheet.appendRow([
      new Date(),
      p.fullname || '',
      p.email || '',
      p.country || '',
      p.mobile || '',
      p.message || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
