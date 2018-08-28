import pprint,geohash2,csv,moment
from datetime import datetime
from lib.geocode import reverseGeocode
from lib.database import db

pp = pprint.PrettyPrinter(depth=6)

# Target Output
# Disaster,Distance_from_disaster_spot,Emergency_level,Days_since_last_supply,Ideal_distrubution,Number_of_available_trucks,Time_since_disaster
# 0,1,1,1,1,12,1,1
# 1,2,2,2,2,3,2,3
# 2,3,3,3,3,4,34,4


# data to track for watson
zones = {}
venue_zone = {}

# find the trucks
all_venues = "function(doc) { if (doc._id[0] == 'v') { for (var idx in doc.gp) { emit(doc.gp[idx].substr(0,3), doc); } } }"
venue_list = db.temporary_query(all_venues)

# analyze venues
for item in venue_list:
    geo_area = item['key']
    if not geo_area in zones:
        zones[geo_area] = {}
        zones[geo_area].update({'truck_count': 0, 'building_count': 0, "days_since_last_supply": -1, "venues": [], "supplies": []})

    if item['value']['ct'] and 'trk' in item['value']['ct']:
        zones[geo_area]['truck_count'] += 1
    else:
        zones[geo_area]['building_count'] += 1

    venue_id = item['value']['_id']
    zones[geo_area]['venues'].append(venue_id)
    venue_zone[venue_id] = geo_area


# analyze supplies
all_supplies = "function(doc) { if (doc._id[0] == 'i') {  emit(doc._id, doc); } }"
supply_list = db.temporary_query(all_supplies)
for item in supply_list:

    # last updated at
    last_update = moment.date(item['value']['$ua'])
    last_update_days =  (moment.utcnow()-last_update).days


    if item['value']['pt']:
        # link supply item with known venue
        for venue_id in item['value']['pt']:
            if venue_id in venue_zone:
                zone_for_supply = venue_zone[venue_id]
                zones[zone_for_supply]['supplies'].append(item['value']['_id'])


                # keep track of most recent update to supply
                days_since = zones[zone_for_supply]["days_since_last_supply"]
                if days_since is -1 or last_update_days <  days_since:
                    zones[zone_for_supply]["days_since_last_supply"] = last_update_days


for geo_area in zones:
    # display data we found per zone
    [lat,lon] = geohash2.decode(geo_area)
    lat = float(lat)
    lon = float(lon)
    name_results = reverseGeocode(lat, lon)
    if (name_results['count'] > 0):
      place_name = name_results['results'][0]['county']
      if not place_name:
        place_name = name_results['results'][0]['name']
      country = name_results['results'][0]['country']
    print("\n\n======= {:s} ({:s}) {:s} =======".format(place_name, country, geo_area))

    data = zones[geo_area]


    with open('lantern_watson_data.csv', 'w') as csvfile:

        writer = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)

        # total truck count for area
        writer.writerow(["Days_since_last_supply", "Number_of_available_trucks"])
        print("Number_of_available_trucks = {:d}".format(data['truck_count']))

        # last supply known in this area
        writer.writerow([data["days_since_last_supply"], data["truck_count"]])
        print("Days_since_last_supply = {:d}".format(data['days_since_last_supply']))
    print("-----")
    pp.pprint(data)
    print("==========================================================\n")