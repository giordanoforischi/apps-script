# URL 2 Text

This simple AppsScript project enables the user to select cells and call a microservice for each of them, persisting the information retrieved from the cloud function in a column set by the user. On this example the microservice extracts visible text content from a given URL.

## Configuration steps

* Configure AppsScript to display the manifest file.
* Add this code page to AppsScript, including the appsscript.json OAuth scopes.
* Add both Script Properties to the config panel (MAX_CELLS_LIMIT=int value AND CF_URL=your Cloud Function URL)
* Link the worksheet to your Cloud Function's GCP project.
* After linking the Google Sheet to GCP, it might be necessary to redeploy the Cloud Function in order to reflect client ID changes.
* Add menu open function to triggers.
* Set default column using app menu.

# OAuth Scopes (appscript.json file)

    {
    "timeZone": "America/Sao_Paulo",
    "dependencies": {},
    "exceptionLogging": "STACKDRIVER",
    "runtimeVersion": "V8",
    "oauthScopes": [
        "openid",
        "https://www.googleapis.com/auth/script.external_request",
        "https://www.googleapis.com/auth/spreadsheets.currentonly",
        "https://www.googleapis.com/auth/script.scriptapp"
    ]
    }