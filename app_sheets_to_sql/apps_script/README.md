# appscript-sheets-to-sql
This is an AppsScript addon that regularly uploads sheets data from multiple Sheets files and tabs to a SQL database, through an intermediate microservice.

For the Sheet files list, it has a method to retrieve all files in a Drive folder.

This implementation also deals with AppsScript's quota limit by ending the recurrent trigger when it has reached the maximum executions, starting it again the next day.

Repo files are in .js but have to be created as .gs files in AppsScript.

The GCP backend microservice receives the data and opens up a connection to the database, uploading the data and merging it.

