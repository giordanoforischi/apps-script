function onOpen() {

    const ui = SpreadsheetApp.getUi();

    ui.createMenu('Trigger')
        .addItem('Update one row', 'update')
        .addItem('Activate scheduled run', 'activateTrigger')
        .addItem('Deactivate scheduled run', 'deactivateTrigger')
        .addToUi();
}

const refreshMenu = () => {
    const checkIfActive = () => {
        const triggers = ScriptApp.getProjectTriggers().map(t => t.getHandlerFunction())
        return triggers.includes('update')
    }

    if (checkIfActive()) {
        SpreadsheetApp.getUi().createMenu('Trigger')
            .addItem('Update one row', 'update')
            .addItem('Deactivate scheduled run', 'deactivateTrigger')
            .addToUi();
    } else {
        SpreadsheetApp.getUi().createMenu('Trigger')
            .addItem('Update one row', 'update')
            .addItem('Activate scheduled run', 'activateTrigger')
            .addToUi();
    }
}