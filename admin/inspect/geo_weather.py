import pprint,geohash2
from lib.database import db
from lib.weather import forecast
from lib.geocode import reverseGeocode

# setup pretty print
pp = pprint.PrettyPrinter(depth=6)

# count total for each type of document
precision = 3

# find all venues and group by geolocation
map_func = "function(doc) { if (doc._id[0] == 'v' && doc.hasOwnProperty('gp') && typeof(doc.gp) == 'object') { for (var idx in doc.gp) { emit(doc.gp[idx].substr(0," + str(precision) + "), 1); } } }"
reduce_func = "_count"

results = db.temporary_query(map_func, reduce_func, group=True)


def handleForecastResponse(res):
  if res and res['dayOfWeek']:
    days = res['dayOfWeek']
    print('[forecast] returned %d-day forecast' % (len(days)))

    # each entry in the response object is an array with
    # entries in the array applying to the day of the week
    # (i.e., res['dayOfWeek']) matched by the index
    for index, day in enumerate(days):
      maxtemp = str(res['temperatureMax'][index]) if res['temperatureMax'][index] else 'n/a'
      mintemp = str(res['temperatureMin'][index]) if res['temperatureMin'][index] else 'n/a'
      print ('[forecast] %s - High of %s, Low of %s' % (day, maxtemp, mintemp) )
      print ('[forecast] %s - %s' % (day, res['narrative'][index]) )

    # additional entries include (but not limited to):
    # moonPhase, sunriseTimeLocal, daypart['precipChance'], daypart['windDirection'], etc
  else:
    print('[forecast] daily forecast returned')



for item in results:
  count = item['value']
  geo_area = item['key']
  [lat,lon] = geohash2.decode(geo_area)
  lat = float(lat)
  lon = float(lon)

  name_results = reverseGeocode(lat, lon)

  if (name_results['count'] > 0):

    place_name = name_results['results'][0]['county']

    if not place_name:
      place_name = name_results['results'][0]['name']

    country = name_results['results'][0]['country']
    print("\n\n======= {:s} ({:s}) =======".format(place_name, country))

  print(("[ lantern] Found {:d} venues nearby {:s} ({:.2f},{:.2f})").format(count, geo_area, lat, lon))
  weather = forecast(lat, lon)
  handleForecastResponse(weather)
  print("\n\n\n")