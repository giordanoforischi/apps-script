const getStatusFromCell = (status) => {
  try {
    return JSON.parse(status)
  } catch (e) {
    return {}
  }
}

class FileStatus {
  constructor(cell) {
    this.cell = cell
    this.status = this.getStatusFromCell()
    this.init()
  }

  getStatusFromCell() {
    try {
      return JSON.parse(this.cell.getValue())
    } catch (e) {
      return {}
    }
  }

  // This method validates if status has 'sheets' property.
  init() {
    if (this.status.hasOwnProperty('sheets') && Array.isArray(this.status?.sheets) && this.status?.sheets.length > 0) {
      return this.status.sheets
    } else {
      this.status = { finished: false, sheets: [] }
      this.saveStatusToCell()
    }
  }

  getSheetStatus(sheet) {
    return this.status.sheets.find(s => s.name == sheet.getSheetName())
  }

  isFileFinished() {
    return this.status?.finished
  }

  isSheetFinished() {
    return this.status.finished
  }

  finishFile() {
    log('trace', `Finishing file...`)
    this.status = { ...this.status, finished: true }
    this.saveStatusToCell()
  }

  setSheetStatus(sheetName, sheetStatus, lastUploadedRow = null) {
    const sheets = this.status.sheets.filter(s => s.name !== sheetName)
    const newSheets = [...sheets, { "name": sheetName, status: sheetStatus, lastUploadedRow }]

    this.status = { ...this.status, sheets: newSheets }
    this.saveStatusToCell()
  }

  setLastUploadedRow(sheetName, row) {
    const sheets = this.status.sheets.filter(s => s.name !== sheetName)
    const newSheets = [...sheets, { "name": sheetName, status: 'unfinished', lastUploadedRow: row }]

    this.status = { ...this.status, sheets: newSheets }
    this.saveStatusToCell()
  }

  setError(sheetName, e) {
    const sheet = this.status.sheets.find(s => s.name == sheetName)
    const newSheets = [...this.status.sheets, { ...sheet, "name": sheetName, "status": 'finished', error: e }]

    this.status = { ...this.status, sheets: newSheets }
    this.saveStatusToCell()
  }

  saveStatusToCell() {
    this.cell.setValue(JSON.stringify(this.status))
  }

  reset() {
    this.status.finished = false
    this.status.sheets = this.status.sheets.map(sheet => {
      return { ...sheet, status: sheet.status == 'finished' || sheet.status == 'invalid_header_or_empty' ? 'unfinished' : sheet.status }
    })
    this.saveStatusToCell()
  }
}
