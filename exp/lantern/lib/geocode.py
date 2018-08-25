import os,requests

HOST = 'https://geocoder.tilehosting.com'
REVERSE_GEOCODE_API = '/r/' 

defaultParams = {
  'qs': {
    'key': os.environ['GEOCODE_API_KEY'],
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


def reverseGeocode(lat, lon):
    url = HOST + REVERSE_GEOCODE_API + str(lon) + "/" + str(lat) + ".js"
    options = defaultParams
    r = requests.get( url, params=options['qs'], headers=options['headers'] )
    if r.status_code == 200:
      return r.json()
    else:
      handleFail(r)


def handleFail(err):
  # API call failed...
  pprint(vars(err))
  print('Status code: %d' % (err.status_code) )