# apps-script
AppsScript projects backup repo with a template .md file for documentation and some useful code snippets.

## Useful info

* [How to auth AppsScript to GCP](https://stackoverflow.com/questions/61781421/securely-calling-a-google-cloud-function-via-a-google-apps-script)

## Code snippets

### Script properties

Get: `parseInt(PropertiesService.getScriptProperties().getProperty('A_NUMBER'));`

Set: `PropertiesService.getScriptProperties().setProperty('MY_PROP', propValue);`

### Input modal

    var ui = SpreadsheetApp.getUi();

    const response = ui.prompt('Please enter a text:', ui.ButtonSet.OK_CANCEL);
    
    if (response.getSelectedButton() == ui.Button.CANCEL) { return null; };

### Fetch GCP with auth

    const options = {
        muteHttpExceptions: true, method: 'POST'
        , headers: { 'Authorization': `Bearer ${ScriptApp.getIdentityToken()}`, 'Content-type': 'application/json' }
        , payload: JSON.stringify({ attr: value })
    };
    const response = UrlFetchApp.fetch(url, options);