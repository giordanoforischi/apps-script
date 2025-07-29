import pandas as pd
# import json

import mysql.connector 

from sqlalchemy import create_engine

# Python version: 3.10
import functions_framework

# Variables
host = 'IP'
user = 'USER'
passwd = 'PASSWORD'
db = 'DATABASE'
table = 'TABLE_NAME'
port = 3306

def make_error_response(message):
    return {
        "statusCode": 501,
        "body": message,
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
@functions_framework.http
def main(request):
  
    # Db conn
    try:
        engine = create_engine(f"mysql+mysqlconnector://{user}:{passwd}@{host}:{port}/{db}")
        
        cnx = mysql.connector.connect(
            host = host,
            user = user,
            password = passwd,
            db = db,
            port = port
        )
        
        cursor =  cnx.cursor()

        print('Connected to db successfully.')
        
    except Exception as e:
        return make_error_response(f'Unexpected error connecting to the database. Please call your system admin for help. Error: {str(e)}')

    # Data work
    try:
        print('Extracting data from payload...')
        data = request.get_json(silent=True)

        df = pd.DataFrame(data[1:], columns = data[0])
        
        df = df.reset_index(drop=True)
    except Exception as e:
        return make_error_response(f'Unexpected error upon loading data to Pandas. Please call your system admin. Error: {str(e)}')
    
    # Saves data to temp table and merges it
    try:
        df.to_sql(table, con = engine, if_exists = 'replace', index=True) 
        cursor.callproc('merge_data')
        print('Data merged.')
    except Exception as e:
        print(str(e))
        return make_error_response(f'Error merging data to final table. Check your sheet for duplicated headers or other inconsistencies, or call the system admin. Error: {str(e)}')
    
    # Ends
    try:
        cursor.close()
    except Exception as e:
        print(str(e))
        return make_error_response(f'Unexpected error finishing up Function. Please call your system admin for help. Error: {str(e)}')
    
    return f'Data saved sucessfully.', 200