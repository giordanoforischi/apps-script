# URL 2 Text

This simple AppsScript project enables the user to select cells and call a microservice for each of them, persisting the information retrieved from the cloud function in a column set by the user. On this example the microservice extracts visible text content from a given URL.

## Configuration steps

* Configure AppsScript to display manifest file.
* Add this code page to AppsScript, including appsscript.json oauth scopes.
* Add both Script Properties to the config panel (TEXT_COLUMN = 0 and MAX_CELLS_LIMIT=250)
* Link the worksheet to your Cloud Function's GCP project ID..
* After linking Google Sheet to GCP, it's necessary to redeploy the Cloud Function in order to reflect client ID changes.
* Add menu open function to triggers.