import urllib3, requests, json
import pandas as pd
import numpy as np
from sklearn.externals import joblib


def extract_test_data(filename):
    df = pd.read_csv(filename)
    test_data =[i.tolist() for i in df.values]
    return test_data


def format_results(response):
    result = json.loads(response.text)
    m = []
    n = []
    o = []
    for i in result['values']:
        m = i[0:8]
        n = i[-1]
        m.append(n)
        o.append(m)

    scaler = joblib.load('data_scaler.joblib')
    _scaled_data = scaler.inverse_transform(o)
    scaled_data = _scaled_data.tolist()

    for i in range(len(o)):
        scaled_data[i][5] = o[i][5]

    for i in range(len(scaled_data)):
        result['values'][i][:8] = scaled_data[i][0:8]
        result['values'][i][-1] = scaled_data[i][-1]
    with open('results.json', 'w') as results:
        json.dump(result, results)

    return print('Result json created')

test_data = extract_test_data('normalized_boston_flood_testing.csv')


# retrieve your wml_service_credentials_username, wml_service_credentials_password, and wml_service_credentials_url from the
# Service credentials associated with your IBM Cloud Watson Machine Learning Service instance

wml_credentials={
"url": 'https://us-south.ml.cloud.ibm.com',
"username": "79de341a-e212-4a3c-8ed8-d8957fe11984",
"password": "7282de90-ef45-4358-8916-b16b9664f6b3"
}


headers = urllib3.util.make_headers(basic_auth='{username}:{password}'.format(username=wml_credentials['username'], password=wml_credentials['password']))
url = '{}/v3/identity/token'.format(wml_credentials['url'])
response = requests.get(url, headers=headers)
mltoken = json.loads(response.text).get('token')

header = {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + mltoken}

# NOTE: manually define and pass the array(s) of values to be scored in the next line
payload_scoring = {"fields": ["Distance_from_disaster_spot",
                              "Area_Population",
                              "Number_of_service_requests",
                              "Infant_population",
                              "Aged_population",
                              "Emergency_level",
                              "Hours_since_last_supply",
                              "Quality_score"],
                   "values": test_data}

response_scoring = requests.post('https://us-south.ml.cloud.ibm.com/v3/wml_instances/c9755156-1957-43d7-97eb-c8a735211ef1/deployments/d0c9b097-cd7f-4fb3-8b05-e0451211f4cb/online',
                                 json=payload_scoring, headers=header)

print("Scoring response")

format_results(response_scoring)
