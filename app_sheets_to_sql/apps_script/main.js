const reset = () => {
  setCachedVariables()

  // Resets finished sheets and files to 'unfinished' so they can run again. Only new rows will posteriorly be sent to AWS.
  resetStatus()

  // Restarts 7-min frequency recursive triggers. Sends a variable so update will not update cache.
  setRecursiveTrigger()
}

const update = () => {
  setCachedVariables()

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('main');
  const dataRegion = sheet.getRange(1, 1).getDataRegion()
  const files = structureData(dataRegion.getValues()[0], dataRegion.getValues().slice(1))

  const isFinished = files.every(f => getStatusFromCell(f.status).finished)
  if (!isFinished) {
    setRecursiveTrigger() // If not finished, keeps running triggers for data upload execution.
    findNextUpload(sheet, files)
  } else {
    // If all files have run and are finished, stops recursive triggers to save on AppsScript daily trigger quota. 
  }

  return null
}

const findNextUpload = (sheet, files) => {
  const statusColumn = CacheService.getScriptCache().get('status_column')

  // Iterate over list of files
  // Using regular for loop because it needs to break when execution halts.
  for (let i = 0; i < files.length; i++) {
    const fileData = files[i]

    log('trace', `Working on file ${i + 1}/${files.length}: ${fileData?.name}`)

    var statusRng = sheet.getRange(i + 2, statusColumn)
    var fileStatus = new FileStatus(statusRng)

    // If file finished, skip to next. Else, calls uploading method.
    if (!fileStatus.isFileFinished()) {
      try {
        var file = new File(fileData, fileStatus)
        if (!hasTimeLeft()) { throwHaltError() } // If too close to end of process execution, halts.
        file.upload()
        file.status.finishFile()
        SpreadsheetApp.flush()
      } catch (e) {
        if (e.halt) {
          log('trace', 'Execution finished.')
          break;
        } else {
          log('error', 'Unexpected error', e) // Skips to next file if error, but sends an error report to admin emails.
        }
      }
    }
  }
}

const structureData = (header, rows) => {
  return rows.map((row, vIndex) => {
    const rowObj = {}
    row.forEach((cell, index) => rowObj[header[index]] = cell)
    rowObj.row = vIndex + 2
    return rowObj
  })
}

const resetStatus = () => {
  setCachedVariables()

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('main');
  const dataRegion = sheet.getRange(1, 1).getDataRegion()
  const files = structureData(dataRegion.getValues()[0], dataRegion.getValues().slice(1))
  const statusColumn = CacheService.getScriptCache().get('status_column')

  // Iterate over list of files and resets the status
  files.map((fileData, index) => {
    log('trace', `Resetting file ${index + 1}/${files.length}: ${fileData?.name}`)

    var statusRng = sheet.getRange(index + 2, statusColumn)
    var fileStatus = new FileStatus(statusRng)

    fileStatus.reset()
  })
}