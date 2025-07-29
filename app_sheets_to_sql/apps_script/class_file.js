class File {
  constructor(fileData, fileStatus) {
    this.id = fileData.id;
    this.name = fileData.name;
    this.ss = SpreadsheetApp.openById(this.id);
    this.sheets = this.ss.getSheets();
    this.status = fileStatus
  }

  // Of all sheets in current file, remove any that are 'finished' in file's status log
  getPendingSheets() {
    return this.sheets
      .map(sheet => ({ sheet, ...this.status.getSheetStatus(sheet) }))
      .filter(sheet => (sheet?.status !== 'finished' && sheet?.status !== 'invalid_header') || !sheet.hasOwnProperty('status'))
  }

  // Load method will read saved sheets array and work only on pending data.
  upload() {
    // First, it gets sheet status from file status object, if there's any.
    const pendingSheets = this.getPendingSheets()

    // For each sheet that has pending data to be uploaded, validates columns and uploads data. 
    // Not using a 'forEach' loop here because loop needs to be halted when trigger execution time is too close to finishing.
    for (let i = 0; i < pendingSheets.length; i++) {
      const s = pendingSheets[i]

      if (hasTimeLeft) {
        try {
          const sheet = new Sheet(s.sheet, this.id, this.name, this.status, s?.lastUploadedRow)
          sheet.upload()
        } catch (e) {
          if (e?.halt) {
            throw e
          } else {
            log('error', 'Unexpected error', e) // If sheet receives a unexpected/non-halting error, continue execution on next sheet.
          }
        }
      } else {
        break;
      }
    }
  }
}


