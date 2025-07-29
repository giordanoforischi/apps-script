# AppsScript snippets and projects

This is an AppsScript projects repo with some useful code snippets.

## Links and documentation

- [How to auth AppsScript to GCP](https://stackoverflow.com/questions/61781421/securely-calling-a-google-cloud-function-via-a-google-apps-script)

## Code snippets

#### Get script properties: 
```js
parseInt(PropertiesService.getScriptProperties().getProperty('A_NUMBER'));
```

#### Set script properties: 
```js
PropertiesService.getScriptProperties().setProperty('MY_PROP', propValue);
```

#### Create input modal

```js
var ui = SpreadsheetApp.getUi();

const response = ui.prompt('Please enter a text:', ui.ButtonSet.OK_CANCEL);

if (response.getSelectedButton() == ui.Button.CANCEL) { return null; };
```

#### Fetch GCP with auth

```js
const options = {
    muteHttpExceptions: true
    , method: 'POST'
    , headers: { 
        'Authorization': `Bearer ${ScriptApp.getIdentityToken()}`
        , 'Content-type': 'application/json' 
    }
    , payload: JSON.stringify({})
};
const response = UrlFetchApp.fetch(url, options);
```