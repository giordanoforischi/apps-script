function processSelectedCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rangeList = sheet.getActiveRangeList();
  const maxLimit = parseInt(PropertiesService.getScriptProperties().getProperty('MAX_CELLS_LIMIT'));
  const specifiedColumn = getSpecifiedColumn(sheet);

  // Check if any cells are selected
  if (!rangeList || rangeList.getRanges().length === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No cells selected!', 'Error', 5);
    return;
  };

  // Build array of cell objects with cell address and value
  const cellObjects = [];
  rangeList.getRanges().forEach(range => {
    range.getValues().forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        const cell = range.getCell(rowIndex + 1, colIndex + 1);
        const cellAddress = cell.getA1Notation();
        if (colIndex + 1 <= specifiedColumn && cellValue !== '') {
          cellObjects.push({ address: cellAddress, url: cellValue });
        }
      });
    });
  });

  // Check if number of non-empty cells exceeds the specified limit
  if (cellObjects.length > maxLimit) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Number of selected non-empty cells exceeds the specified limit of ${maxLimit}!`, 'Error', 5);
    return;
  }

  // Define the chunk size
  const chunkSize = 75;
  // Initialize an array to hold the chunked arrays
  const chunkedArrays = [];

  // Split cellObjects into chunks of size chunkSize
  cellObjects.forEach((_, index) => {
    if (index % chunkSize === 0) {
      chunkedArrays.push(cellObjects.slice(index, index + chunkSize));
    }
  });

  // Make requests for each chunk using fetchAll
  const url = PropertiesService.getScriptProperties().getProperty('CF_URL');
  const requests = chunkedArrays.map(chunk => {
    return {
      url: url, muteHttpExceptions: true, method: 'POST',
      headers: { 'Authorization': `Bearer ${ScriptApp.getIdentityToken()}`, 'Content-Type': 'application/json' },
      payload: JSON.stringify({ cells: chunk })
    };
  });
  const responses = UrlFetchApp.fetchAll(requests);

  // Process responses and update the sheet
  responses.forEach((response, index) => {
    const responseData = JSON.parse(response.getContentText());
    const chunk = chunkedArrays[index];
    responseData.forEach((data, dataIndex) => {
      const cellObject = chunk[dataIndex];
      const urlText = data.urlText;
      const row = sheet.getRange(cellObject.address).getRow();
      sheet.getRange(row, specifiedColumn).setValue(urlText.substring(0, 49999));
    });
  });
}

function getSpecifiedColumn(sheet) {
  const textColumnInfoStr = PropertiesService.getScriptProperties().getProperty('TEXT_COLUMN');
  if (textColumnInfoStr) {
    const textColumnInfoArr = JSON.parse(textColumnInfoStr);
    const sheetId = sheet.getSheetId();
    const textColumnInfo = textColumnInfoArr.find(info => info.sheetId === sheetId);
    if (textColumnInfo) {
      return textColumnInfo.column;
    } else {
      throw new Error("Your default URL text column isn't set for this sheet! Please use the menu to set a column.");
    }
  } else {
    throw new Error("Your default URL text column isn't set! Please use the menu to set a column.");
  }
}

const setTextColumn = () => {
  const getColumnFromLetter = (letter) => {
    let column = 0;
    for (const char of letter.toUpperCase()) {
      column *= 26;
      column += char.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }
    return column;
  };

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Please enter the column letter where URL content text will be saved to:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() == ui.Button.CANCEL) { return null; }

  const input = response.getResponseText().toUpperCase().replace(/[^A-Z]/g, '');
  const column = getColumnFromLetter(input);

  if (column < 2 || column > 1000) {
    ui.alert('Invalid input. Please enter a valid column letter or combination of letters starting from column B.');
  } else {
    const sheetId = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSheetId();
    let textColumnInfoStr = PropertiesService.getScriptProperties().getProperty('TEXT_COLUMN');
    let textColumnInfoArr = [];
    if (textColumnInfoStr) {
      textColumnInfoArr = JSON.parse(textColumnInfoStr);
    }
    textColumnInfoArr.push({ sheetId: sheetId, column: column });
    PropertiesService.getScriptProperties().setProperty('TEXT_COLUMN', JSON.stringify(textColumnInfoArr));
    ui.alert(`Perfect! Letter ${input} is equivalent to column number '${column}' and was set as the default column to save URL content.`);
  }
}
