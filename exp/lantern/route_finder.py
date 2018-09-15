import moment,csv
from datetime import datetime
from lib.database import db
from lib import zones
from lib.distance import calculateDistance


# where are we exporting our csv data for training?
csv_file_name = 'lantern_watson_data.csv'

# context metadata determined by bot conversation before routing
scenario_supply_type = "wtr" # can be determined by quantity and rate of requests for given supply
scenario_emergency_level = 3 # simulated level
scenario_type = 1 # flood scenario
scenario_ideal_distribution = 10 # water in liters per truck route @todo calculate this intelligently
scenario_optimal_number_of_trucks = 1
scenario_start = moment.utc(2018, 9, 6) # date of disaster start


# identify general geographic zone of disaster to operate within
greater_boston_area_geohash = "drt"
print("selected zone is: {:s}".format(greater_boston_area_geohash))
print("---")

# pull in data from the zone
zone_data = zones.getOne(greater_boston_area_geohash)

print("zone is near: {:s}, {:s}".format(zone_data['name'][0], zone_data['name'][1]))
print("---")

print("places in zone: {:d}".format(len(zone_data['places'])))
print("vehicles in zone: {:d}".format(len(zone_data['vehicles'])))
print("items in zone: {:d}".format(len(zone_data['supplies'])))
print("routes in zone: {:d}".format(len(zone_data['routes'])))
print("---")


def getSupplyDates():
    supply_dates = []
    for supply in zone_data['supplies']:
        # only look for water supplies
        if scenario_supply_type in supply['ct']:
            supply_dates.append(moment.date(supply['$ca']))
    return supply_dates

def calculateHoursSinceSupply(now,supply_dates):
    winner = None
    for date in supply_dates:
        if not winner or winner < date:
            winner = date
    diff = now.diff(winner, 'hours')
    hours_since = round(diff.seconds/60/60)
    hours_since = hours_since + (diff.days*24)
    return hours_since

def calculateHoursSinceDisaster(route):
    route_completed_date = moment.date(route['$ua'])
    diff = route_completed_date.diff(scenario_start)
    hours_since = round(diff.seconds/60/60)
    hours_since = hours_since + (diff.days*24)
    return hours_since


def writeHeaderRow(writer):
    writer.writerow([
        "Disaster", 
        "Distance_from_disaster_spot",
        "Emergency_level",
        "Hours_since_last_supply",
        "Quality_score",
        "Number_of_available_trucks",
        "Hours_since_disaster",
        "Optimal_number_of_trucks",
        "Ideal_distribution"
    ])

def writeTrainingRow(route, writer):

    writer.writerow([
        scenario_type,
        calculateDistance(route),
        scenario_emergency_level,
        calculateHoursSinceSupply(moment.utcnow(), getSupplyDates()),
        int(route['rt']*100),
        len(zone_data['vehicles']),
        calculateHoursSinceDisaster(route),
        scenario_optimal_number_of_trucks,
        scenario_ideal_distribution
    ])


with open(csv_file_name, 'w') as csvfile:
    writer = csv.writer(csvfile, delimiter=',',
                        quotechar='|', quoting=csv.QUOTE_MINIMAL)
    writeHeaderRow(writer)
    for route in zone_data['routes']:
        writeTrainingRow(route, writer)
    print("completed csv export to {:s}...".format(csv_file_name))