function myFunction() {
  CacheService.getScriptCache().removeAll(['error_sent']);
}

function sendTestMail() {
  GmailApp.sendEmail("user_email", "Error in AppsScript automation."
    , `<html> Hey <br/> Test </html>`
  );

    MailApp.sendEmail({
    to: "user_email"
    , subject: "Error in AppsScript automation."
    , htmlBody: `Unexpected error in AppsScript automation. Error: ${e.message}`
  });
}

function testOpenSheet () {
  SpreadsheetApp.openById('SHEET_ID');
}