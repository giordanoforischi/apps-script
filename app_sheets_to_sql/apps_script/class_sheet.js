class Sheet {
  constructor(sheet, parentFileId, parentFileName, status, lastUploadedRow) {
    this.parentFileId = parentFileId
    this.parentFileName = parentFileName
    this.sheet = sheet
    this.name = this.sheet.getSheetName()
    this.status = status

    this.defaultColumns = CacheService.getScriptCache().get('default_columns')
    this.defaultHeader = JSON.parse(CacheService.getScriptCache().get('default_headers'))

    // Header variables 
    this.hasHeader = this.sheet.getRange(1, 1).getValue() == 'name'
    this.header = this.sheet.getRange(1, 1, 1, this.defaultColumns).getValues()[0]

    // Row variables
    this.lastRow = this.sheet.getLastRow()
    this.lastUploadedRow = lastUploadedRow // Comes as null if empty

    this.nextRowToUpload = this.lastUploadedRow ? this.lastUploadedRow + 1 : this.hasHeader ? 2 : 1
    this.quantityOfRowsToUpload = this.lastRow - this.nextRowToUpload + 1

    this.uploadRowsLimit = CacheService.getScriptCache().get('max_lambda_rows')
  };

  isHeaderValid() {
    const headerCheck = this.hasHeader
      ? this.defaultHeader.every((col, index) => this.header[index] == col)
      : this.defaultHeader.length == this.header.length

    // const rowsCheck = this.lastRow >= (this.hasHeader ? 2 : 1)

    return headerCheck // && rowsCheck //&& statusUnfinishedButFinishedCheck
  };

  isEmpty() {
    return this.lastRow == (this.hasHeader ? 1 : 0)
  }

  // Main function
  upload() {
    log('trace', `Working on sheet: ${this.name}`)

    if (this.isHeaderValid()) {
      this.runChunks() // If all chunks run OK, returns true. If there was not enough time to run all chunks, returns false.
      this.status.setSheetStatus(this.name, 'finished', this.lastUploadedRow)
    } else {
      log('trace', `Sheet ${this.name} has invalid header.`)
      this.status.setSheetStatus(this.name, 'invalid_header')
    }
  }

  // Chunk functions
  runChunks() {
    const chunks = this.getChunks()

    // Not using forEach here because the loop needs to finish when encountering an error.
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      if (hasTimeLeft()) {
        log('trace', `Running chunk ${i + 1}/${chunks.length}...`)
        try {
          const data = this.getData(chunk)
          this.postData(data.data)
          this.lastUploadedRow = data.lastRowToUpload
          this.status.setLastUploadedRow(this.name, data.lastRowToUpload) // When chunk finishes, saves last sent row in status.
        } catch (e) {
          log('error', `Unexpected error in chunk: ${chunk + 1}`, e)
          this.status.setError(this.name, e.message)
          break;
          // throw e // Any unexpected error saving chunks stops everything and goes to next sheet
        }
      } else { throwHaltError() }
    }
  }

  getChunks() {
    if (this.quantityOfRowsToUpload > 0){
      const chunks = [...Array(Math.ceil(this.quantityOfRowsToUpload / this.uploadRowsLimit)).keys()] // This is like a range function in Python

        log('debug', `Row quantity to upload: ${this.quantityOfRowsToUpload}`)
        log('debug', `Chunks: `, chunks)

        return chunks;
    } else {
      return [];
    };
  };

  getData(chunk) {
    const initialRowToUpload = chunk * this.uploadRowsLimit + this.nextRowToUpload
    var lastRowToUpload = ((chunk + 1) * this.uploadRowsLimit) - 1 + this.nextRowToUpload
    lastRowToUpload = lastRowToUpload > this.lastRow ? this.lastRow : lastRowToUpload
    const rowQuantity = lastRowToUpload - initialRowToUpload + (lastRowToUpload > this.lastRow ? 1 : 0) + 1

    const rng = this.sheet.getRange(initialRowToUpload, 1, rowQuantity, this.defaultColumns)
    let data = rng.getValues()
    const formulas = rng.getFormulas()

    data.forEach((row, index) => {
      if (row[10] == "#ERROR!") {
        data[index][10] = formulas[index][10]
      } 
    })

    const addedHeaderData = [this.defaultHeader, ...data]
    const iso_datetime_now = new Date().toISOString().replace("Z", "").replace("T", " ")

    const addedColumns = addedHeaderData.map((row, index) => {
      if (index == 0) {
        return [...row, 'gsheet_file', 'gsheet_file_id', 'upload_datetime', 'gsheet_tab', 'created_at']
      } else {
        return [...row, this.parentFileName, this.parentFileId, iso_datetime_now, this.name, iso_datetime_now]
      }
    })

    return { data: addedColumns, lastRowToUpload }
  }


  // API functions
  postData(data) {
    const url = CacheService.getScriptCache().get('function_url')

    const options = {
      'method': 'POST'
      , 'payload': JSON.stringify(data)
      , 'muteHttpExceptions': true
      , 'headers': { 
        'Content-Type': 'application/json'
        , 'Authorization': `Bearer ${ScriptApp.getIdentityToken()}` 
      }
    }

    const res = UrlFetchApp.fetch(url, options)

    if (res.getResponseCode() !== 200) {
      throw new Error(`${res.getContentText()}. File ${this.parentFileName}, sheet ${this.name}`)
    } else {
      log('debug', 'Returned 200')
    }
  }
}