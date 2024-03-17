// Function to create a custom menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('URL2Text')
    .addItem('Process Selected Cells', 'processSelectedCells')
    .addItem('Set Default Text Column', 'setTextColumn')
    .addToUi();
};

// Function to process selected cells
function processSelectedCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const specifiedColumn = parseInt(PropertiesService.getScriptProperties().getProperty('TEXT_COLUMN'));
  const maxLimit = parseInt(PropertiesService.getScriptProperties().getProperty('MAX_CELLS_LIMIT'));

  if (specifiedColumn === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Your default URL text column isn't set! Please use the menu to set a column.", 'Error', 5);
    return
  };

  // Check if any cells are selected
  if (selection.getNumRows() === 0 || selection.getNumColumns() === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No cells selected!', 'Error', 5);
    return;
  };

  // Check if selected cells are to the right of the specified column
  if (selection.getColumn() > specifiedColumn) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Selected cells can't be to the right of the URL content column!", 'Error', 5);
    return;
  };

  // Check if the number of selected non-empty cells exceeds the specified limit
  if (selection.getValues().flat().filter(value => value !== '').length > maxLimit) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Number of selected non-empty cells exceeds the specified limit of ${maxLimit}!`, 'Error', 5);
    return;
  };

  // Process each selected cell
  selection.getValues().forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const cell = selection.getCell(rowIndex + 1, colIndex + 1);
      if (cellValue !== '') {
        const parsedValue = fetchFromFunction(cellValue);
        sheet.getRange(cell.getRow(), specifiedColumn).setValue(parsedValue);
      }
    });
  });
};

function fetchFromFunction(url) {
  // This Cloud Function is a microservice that fetches HTML from a URL and returns the visible text on the page.
  const cloudFunctionURL = parseInt(PropertiesService.getScriptProperties().getProperty('CF_URL'));

  const options = {
    muteHttpExceptions: true
    , method: 'POST'
    , headers: { 'Authorization': `Bearer ${ScriptApp.getIdentityToken()}`, 'Content-type': 'application/json' }
    , payload: JSON.stringify({ "url": url })
  };

  const response = UrlFetchApp.fetch(cloudFunctionURL, options)
  const code = response.getResponseCode()
  if (code === 401 || code === 501) {
    return 'Error, contact your system administrator.'
  } else {
    return response.getContentText()
  };
};

const setTextColumn = () => {
  const getColumnFromLetter = (letter) => {
    let column = 0;
    for (const char of letter.toUpperCase()) {
      column *= 26;
      column += char.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }
    return column;
  };

  var ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Please enter the column letter where URL content text will be saved to:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.CANCEL) { return null; };

  var input = response.getResponseText().toUpperCase().replace(/[^A-Z]/g, '');
  var column = getColumnFromLetter(input);

  if (column < 2 || column > 1000) {
    ui.alert('Invalid input. Please enter a valid column letter or combination of letters starting from column B.');
  } else {
    ui.alert(`Perfect! Letter ${input} is equivalent to column number '${column}' and was set as the default column to save URL content.`);
    PropertiesService.getScriptProperties().setProperty('TEXT_COLUMN', column);
  };
};
