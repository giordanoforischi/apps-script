const update = () => {
    const triggerValue = 'webhook_triggered'
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Sheet1'); // Sheet name: 'Sheet1'
  
    const targetRange = 'Q1'; // Validation column: 'VERIFIED' TODO if client asks, find column automatically
    const columnIndex = sheet.getRange(targetRange).getColumn();
    const lastRow = sheet.getLastRow();
  
    const rangeToUpdate = sheet.getRange(2, columnIndex, lastRow - 1, 1);
  
    // Array starts at 0 and there's a header column, so we find the row by adding 2 to the result index
    const firstEmptyCellRow = rangeToUpdate.getValues().findIndex(cell => cell[0] === '') + 2
  
    // Gets formatted complete row data.
    const rowData = getRowData(sheet, firstEmptyCellRow)
  
    // If firstEmptyCellRow equals 1, there are no more empty records to set
    if (firstEmptyCellRow > 1) {
      const firstEmptyCell = sheet.getRange(firstEmptyCellRow, columnIndex)
      const trigger = triggerWebhook(rowData)
  
      // If call to webhook trigger is OK, sets value on specified column
      trigger && firstEmptyCell.setValue(triggerValue)
    }
  
    refreshMenu()
  }
  
  const getRowData = (sheet, row) => {
    const lastColumnIndex = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastColumnIndex).getValues()[0]
    const data = sheet.getRange(row, 1, 1, lastColumnIndex).getValues()[0]
  
    const returnObj = {}
  
    headers
      .forEach((header, index) => returnObj[header] = data[index])
    //.filter((object) => Object.values(object)[0] && Object.values(object)[0] !== '' )  //Uncomment to filter out data attributes with null values
  
    return returnObj
  }
  
  const triggerWebhook = (data) => {
    try {
      const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(data) };
      const url = 'WEBHOOK_URL'; // Replace with your actual webhook URL
  
      const response = UrlFetchApp.fetch(url, options);
      return response.getResponseCode() == 200 // 200 response code from webhook server means OK
    } catch (e) {
      return false
    }
  }