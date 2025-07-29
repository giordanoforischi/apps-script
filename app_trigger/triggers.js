const getTriggers = () => {
    return ScriptApp.getProjectTriggers();
  }
  
  const activateTrigger = () => {
    const triggers = getTriggers()
  
    if (triggers.length == 0) {
      ScriptApp.newTrigger('update')
        .timeBased()
        .everyMinutes(1)
        .create();
      SpreadsheetApp.getUi().alert('Scheduled run activated successfully.');
    } else {
      SpreadsheetApp.getUi().alert('Scheduled run already active.');
    }
    refreshMenu()
  }
  
  const deactivateTrigger = () => {
    const triggers = getTriggers()
  
    if (triggers.length > 0) {
      triggers.forEach(t => {
        t.getHandlerFunction() == 'update' && ScriptApp.deleteTrigger(t)
      })
      SpreadsheetApp.getUi().alert('Scheduled run deactivated sucessfully.');
    } else {
      SpreadsheetApp.getUi().alert('Scheduled run already deactivated.');
    }
    refreshMenu()
  }