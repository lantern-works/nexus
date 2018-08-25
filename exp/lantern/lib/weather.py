import os,requests

HOST = 'https://api.weather.com'
FORECAST_API = '/v3/wx/forecast/daily/3day' 

defaultParams = {
  'qs': {
    'apiKey': os.environ['WEATHER_API_KEY'],
    'format': 'json',
    'language': 'en-US'
  },
  'headers': {
    'User-Agent': 'Request-Promise',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip'
  },
  'json': True # parse the response as JSON
}


def forecast(lat, lon, units = 'm'):
    url = HOST + FORECAST_API
    options = defaultParams
    options['qs']['geocode'] = ( '%f,%f' % (lat, lon) )
    options['qs']['units'] = units
    r = requests.get( url, params=options['qs'], headers=options['headers'] )
    if r.status_code == 200:
      return r.json()
    else:
      handleFail(r)


def handleFail(err):
  # API call failed...
  pprint(vars(err))
  print('Status code: %d' % (err.status_code) )