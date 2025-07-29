import requests
import re
import functions_framework

from bs4 import BeautifulSoup
from flask import Response

headers = { 'User-Agent': 'url-content-scraper'}

@functions_framework.http
def main(request):
    request_json = request.get_json(silent=True)
    
    if request_json and 'url' in request_json:
        url = request_json['url']
    else:
        return 'No url in request!', 400
   
    response = requests.get(url, headers=headers)
    html = response.content

    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()
    formatted_text = re.sub(r'[\n\s]+', ' ', text)
    return Response(formatted_text, content_type='text/plain; charset=utf-8', status=200)