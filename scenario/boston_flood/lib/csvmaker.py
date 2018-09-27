import moment, csv
from datetime import datetime
from lib.distance import calculateDistance
import numpy as np

# context metadata determined by bot conversation before routing
scenario_supply_type = "wtr"  # can be determined by quantity and rate of requests for given supply
scenario_emergency_level = np.random.randint(low=1, high=4, size=(2000,))  # simulated level
scenario_Number_of_available_trucks = np.random.randint(low=0, high=21, size=(2000,))
scenario_Hours_since_last_supply = np.random.randint(low=1, high=4001, size=(2000,))
scenario_number_of_requests = np.random.randint(low=1, high=101, size=(2000,))
scenario_total_population = np.random.randint(low=2000, high=15001, size=(2000,))
scenario_total_infant_population = np.random.randint(low=2000, high=150001, size=(2000,))
scenario_total_aged_population = np.random.randint(low=2000, high=100001, size=(2000,))
scenario_type = 1  # flood scenario
scenario_ideal_distribution = scenario_Hours_since_last_supply + 4 * scenario_number_of_requests \
                              + np.log(scenario_total_population) \
                              + np.log(2 * scenario_total_infant_population) \
                              + np.log(scenario_total_aged_population) \
                              + np.exp(scenario_emergency_level) \
                              + np.random.randn(2000, )# water in liters per truck route @todo calculate this intelligently
scenario_optimal_number_of_trucks = 1
scenario_start = moment.utc(2018, 9, 6)  # date of disaster start # 5856 -jan , 1224 - july


def getSupplyDates(grouped_docs, route):
    supply_dates = []
    for supply in grouped_docs["items"]:
        # only look for water supplies
        if scenario_supply_type in supply['ct']:
            if not supply['$ca']:
                print("Missing created_at" + supply["_id"])
            else:
                supply_dates.append(moment.utc(supply['$ca']))

    return supply_dates


def getEventFromRoute(grouped_docs, route):
    for event in grouped_docs["events"]:
        if event["_id"] == route["pt"][0]:
            return event


def calculateHoursSinceSupply(now, supply_dates):
    winner = None

    print(supply_dates)

    for date in supply_dates:
        if not winner or winner < date:
            winner = date

    if not winner:
        print("missing winner")
    else:
        diff = now.diff(winner, 'hours')
        hours_since = round(diff.seconds / 60 / 60)
        hours_since = hours_since + (diff.days * 24)
        return hours_since


def calculateHoursSinceDisaster(event):
    route_completed_date = moment.utc(event['$ca'])
    diff = route_completed_date.diff(scenario_start)
    hours_since = round(diff.seconds / 60 / 60)
    hours_since = hours_since + (diff.days * 24)
    return hours_since


def writeHeaderRow(writer):
    writer.writerow([
        "Disaster",
        "Distance_from_disaster_spot",
        "Area_Population",
        "Number_of_service_requests",
        "Infant_population",
        "Aged_population",
        "Emergency_level",
        "Hours_since_last_supply",
        "Quality_score",
        "Number_of_available_trucks",
        "Hours_since_disaster",
        "Optimal_number_of_trucks",
        "Ideal_distribution"
    ])


def writeTrainingRow(grouped_docs, route, writer, count):
    event = getEventFromRoute(grouped_docs, route)
    quality_score = route.get("rt", -1)

    vehicle_count = 0
    for venue in grouped_docs["venues"]:
        if "trk" in venue["ct"]:
            vehicle_count = vehicle_count + 1

    print(route["_id"])
    hours_since_last_supply = calculateHoursSinceSupply(moment.utcnow(), getSupplyDates(grouped_docs, route))
    if not hours_since_last_supply:
        hours_since_last_supply = -1

    writer.writerow([
        scenario_type,
        calculateDistance(route),
        scenario_total_population[count],
        scenario_number_of_requests[count],
        scenario_total_infant_population[count],
        scenario_total_aged_population[count],
        scenario_emergency_level[count],
        scenario_Hours_since_last_supply[count],
        quality_score,
        vehicle_count,
        calculateHoursSinceDisaster(event),
        scenario_optimal_number_of_trucks,
        scenario_ideal_distribution[count]
    ])


def writeCSV(csv_file_name, grouped_docs):
    with open(csv_file_name, 'w') as csvfile:
        writer = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
        writeHeaderRow(writer)
        # for route in grouped_docs['routes']:
        #     writeTrainingRow(grouped_docs, route, writer)
        # print("completed csv export to {:s}...".format(csv_file_name))
        for i in range(len(grouped_docs['routes'])):
            writeTrainingRow(grouped_docs, grouped_docs['routes'][i], writer, i)
        print("completed csv export to {:s}...".format(csv_file_name))
