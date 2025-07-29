class Validator {
  constructor(app, config) {
    this.app = app
    this.dateColumn = config.dateColumn
    this.sheet = this.getSheetById(config.sheetId)
    this.previousLastRow = config.previousLastRow
    this.currentLastRow = this.getLastRow(this.sheet, this.dateColumn)
    this.numColumns = this.getNumColumns()
    this.dataRegion = this.getDataRegion()
    this.hasData = this.dataRegion ? true : false
    this.isDateColumnOK = this.checkDateColumn()
    this.hasNewData = this.currentLastRow > this.previousLastRow
  }

  getSheetById(id) {
    return this.app.getSheets().find(sheet => sheet.getSheetId() == id)
  };

  getNumColumns() {
    if (this.currentLastRow != 0) {
      return this.sheet.getRange(1, this.dateColumn).getDataRegion().getNumColumns()
    } else {
      return 0
    };
  };

  getLastRow() {
    let maxRow = this.sheet.getLastRow() == 0 ? 1 : this.sheet.getLastRow();
    let maxRowCell = this.sheet.getRange(maxRow, this.dateColumn);

    if (maxRowCell.getValue() !== "") {
      return maxRowCell.getRow();
    } else {
      return maxRowCell.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
    };
  };

  getDataRegion() {
    if (this.currentLastRow > 0 && this.numColumns > 0) {
      return this.sheet.getRange(1, 1).getDataRegion()
    } else {
      return null
    };
  };

  checkDateColumn() {
    let value = this.sheet.getRange(this.currentLastRow, this.dateColumn).getValue()
    return Object.prototype.toString.call(value) == "[object Date]"
  };

  getOldDataRange() {
    return this.sheet.getRange(2, 1, this.previousLastRow - 1, this.numColumns)
  }

  getNewDataRange() {
    return this.sheet.getRange(this.previousLastRow + 1, 1, this.currentLastRow - this.previousLastRow, this.numColumns)
  }
};