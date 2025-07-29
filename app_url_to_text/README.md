# appscript-url-to-text
This is an AppsScript addon that gets the webpage content of URLs in cells and returns in a previously specified column in the sheet, using GCP microservices as a scalable backend for the requests.

The GCP backend microservice scrapes the URL, does a few transformations and cleanup and returns it to AppsScript.