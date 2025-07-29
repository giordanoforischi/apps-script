const getDefaultHeaders = () => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('defaultHeaders')
  const dataRegion = sheet.getRange(1, 1).getDataRegion()
  const values = dataRegion.getValues()

  return values[0].slice(0, -4)
}

const throwHaltError = () => {
  log('trace', 'Too close to end of process execution, halting execution...')
  const error = new Error(`Function execution time is close to an end. Execution has been halted.`);
  error.halt = true
  throw error;
}

const variables = {
  'function_url': "CF_URL"
  , 'function_start_time': new Date().getTime()
  , 'function_max_time_seconds': 360
  , 'max_lambda_rows': 4000 // AWS held up until 5000. Cell debug up to 250
  , 'default_columns': 24
  , 'default_headers': JSON.stringify(getDefaultHeaders())
  , 'status_column': 4
  , 'error_sent': 0
}

const setCachedVariables = () => {
  Object.keys(variables).forEach(key => {
    CacheService.getScriptCache().put(key, variables[key]);
  })
}

const hasTimeLeft = () => {
  // AppsScript has a 6min (360sec) execution time. 
  // If a chunk starts uploading too close (12 seconds) to execution finish, it will be halted and uploaded by the next iteration.
  const initialExecutionTime = CacheService.getScriptCache().get('function_start_time')
  const maxExecutionTime = CacheService.getScriptCache().get('function_max_time_seconds') * 1000
  const now = new Date().getTime()

  const functionHasGoneOnTooLong = maxExecutionTime - (20 * 1000)

  return now - initialExecutionTime <= functionHasGoneOnTooLong
}

const getDriveFiles = () => {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("main");

  var folder = DriveApp.getFolderById('FOLDER_ID');
  var files = folder.getFiles()

  var list = [];
  list.push(['name', 'id', 'link', 'size', 'status']);

  while (files.hasNext()) {
    file = files.next();
    var row = []
    row.push(file.getName(), file.getId(), `https://docs.google.com/spreadsheets/d/${file.getId()}/`, file.getSize(), '')
    list.push(row);
  }

  sh.getRange(1, 1, list.length, list[0].length).setValues(list);
}

const log = (level, message, object) => {
  levels = {
    'debug': 0
    , 'trace': 1
    , 'log': 3
    , 'error': 5
  }

  currentLevel = 1
  showObjects = true

  if (levels[level] >= currentLevel) {
    Logger.log(message)
    showObjects && object ? Logger.log(object) : void (null)
  }

  if (levels[level] >= 5) {
    const errorSent = false

    // This has a 25min expiry time
    // CacheService.getScriptCache().get('error_sent') == 1
    // https://developers.google.com/apps-script/reference/cache/cache?hl=pt-br

    if (!errorSent) {
      CacheService.getScriptCache().put('error_sent', 1);
      reportError(object)
    }
  }
}

const sendReport = () => {
  Logger.log('sent email')
}

const reportError = (e) => {
  GmailApp.sendEmail(
    "USER_EMAIL"
    , "Error in AppsScript automation"
    , `Unexpected error in AppsScript automation. Error: ${e.message}`
  );
}

const getTriggers = () => {
  return ScriptApp.getProjectTriggers();
}

const clearRecursiveTriggers = () => {
  const triggers = getTriggers()

  if (triggers.length > 0) {
    triggers.forEach(t => {
      t.getHandlerFunction() == 'update' && ScriptApp.deleteTrigger(t)
    })
  }
}

const setRecursiveTrigger = () => {
  clearRecursiveTriggers() // Flushes old triggers that aren't deleted automatically by AppsScript.
  ScriptApp.newTrigger('update')
    .timeBased()
    .after(6.25 * 60 * 1000) // 6,25
    .create();
}

