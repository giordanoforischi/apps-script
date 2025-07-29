class Data {
  constructor(app, dataRange, dateColumn) {
    this.app = app
    this.color = null
    this.dataRange = dataRange
    this.sheet = dataRange.getSheet()
    this.dateColumn = dateColumn
    this.lastRow = this.getLastRow()
    this.sort(1)
    this.paint(this.color)
  };

  clear() {
    let allCells = this.sheet.getRange(1, 1, this.sheet.getMaxRows(), this.sheet.getMaxColumns());
    allCells.clear({ contentsOnly: false, skipFilteredRows: false });
  };

  sort(frozenRows) {
    this.sheet.setFrozenRows(frozenRows)
    this.sheet.sort(this.dateColumn, true)  // true:asc, false:desc
    SpreadsheetApp.flush()
  };

  paint(color) {
    this.dataRange.setBackground(color)
  };

  mergeByDate(newDataRange) {
    // Removes previous rows
    try {
      var previousDateColumn = this.dataRange.getValues().map(row => row[this.dateColumn - 1].getTime())
      var newDateColumn = newDataRange.getValues().map(row => row[this.dateColumn - 1].getTime())
    } catch (error) {
      throw new Error('Possivelmente existem linhas com o campo de data faltando. Verifique se alguma linha teve seus dados excluídos.')
    }

    let overlappingDates = previousDateColumn.filter(date => {
      return date >= Math.min(...newDateColumn) && date <= Math.max(...newDateColumn)
    })

    if (overlappingDates.length > 0) {
      var firstRowToRemove = previousDateColumn.findIndex(date => date == Math.min(...overlappingDates)) + 2
      var lastRowToRemove = findLastIndex(previousDateColumn, Math.max(...overlappingDates))
      this.sheet.deleteRows(firstRowToRemove, lastRowToRemove - firstRowToRemove + 2);
    }

    // Paste new rows
    let nextRow = this.lastRow + 1

    newDataRange.moveTo(this.sheet.getRange(nextRow, 1))

    this.sort(1)
  };

  getLastRow() {
    let maxRow = this.sheet.getLastRow() == 0 ? 1 : this.sheet.getLastRow();
    let maxRowCell = this.sheet.getRange(maxRow, this.dateColumn);

    if (maxRowCell.getValue() !== "") {
      return maxRowCell.getRow();
    } else {
      return maxRowCell.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
    }
  };

};

class TempData extends Data {
  constructor(app, dataRange, dateColumn, tempSheetName, color) {
    // Moves data to temp sheet before sending range to super class constructor.
    try {
      var tempSheet = app.insertSheet(tempSheetName)
    } catch (error) {
      var tempSheet = app.getSheetByName(tempSheetName)
      app.deleteSheet(tempSheet)
      tempSheet = app.insertSheet(tempSheetName)
    };

    dataRange.moveTo(tempSheet.getRange(1, 1))
    let tempDataRange = tempSheet.getRange(1, 1).getDataRegion()

    // Sends new data range in tempsheet to super constructor
    super(app, tempDataRange, dateColumn)
    this.paint(color)
    this.sort(0)
  };

  deleteTemp() {
    this.app.deleteSheet(this.sheet)
  };

};

const findLastIndex = (arr, element) => {
  let reverseIndex = arr.reverse().findIndex(e => e == element)
  let count = arr.length

  return reverseIndex >= 0 ? count - reverseIndex : reverseIndex
}