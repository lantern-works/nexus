import moment
from datetime import datetime
from lib.database import db

scenario_supply_type = "wtr" # water supply
scenario_emergency_level = 3
scenario_start_time = moment.utc(2018, 9, 8)
scenario_start_place = "drt2y" # boston / roxbury
scenario_ideal_distribution = 10 # liters of supply type to carry in each vehicle

disaster_types = {"flood": 1} # flood scenario

routes = db.query("route/by_geo")

# disaster scenario / type
def getScenario(route):
	for k,v in disaster_types.items():
		if k in route["tg"]:
			print("disaster type = {:d} ({:s})".format(v,k))
			return v


# distance in km from start to finish
def getDistanceStartToFinish(route):
	# @todo add real distance calculations with geohash library
	calc = len(route["gp"]) * 2
	print("distance = {:d}km".format(calc))
	return calc

def getQualityRating(route):
	rating = int(route["rt"] * 100)
	print("quality rating = {:d}%".format(rating))
	return rating


# find trucks that are nearby
def getTrucksNearby(gp):
	truck_list = []
	# @todo optimize with startkey/endkey, category filter, distance filter
	venues = db.query("venue/by_geo")
	for item in venues:
		if item["key"][0] == "trk":
			truck_list.append(item["value"])

	return truck_list


def getItemsByCategory(cat):
	# @todo use geolocation rather than venues to filter relevant items
	valid_venues = ["v:fen", "v:frn", "v:bwf"]
	item_list = []
	items = db.query("venue/by_item", reduce=False)
	for item in items:
		venue_id = item["key"][0]
		if venue_id in valid_venues:
			item_list.append(item["value"])
			print(item)
	return item_list


print("------ scenario context ------")
print("time = {:s}".format(str(scenario_start_time)))
print("place = {:s}".format(scenario_start_place))
print("emergency level = {:d}".format(scenario_emergency_level))


days_since_disaster =  (scenario_start_time.date-moment.utcnow()).days
print("days since start of disaster = {:d}".format(days_since_disaster))


# how many days has it been since the supply was last delivered?
supply_items = getItemsByCategory(scenario_supply_type)
print(supply_items)
if len(supply_items):
	days_since_last_supply = 1
else:
	days_since_last_supply = -1

print("days since supply delivered = {:d}".format(days_since_last_supply))


# which trucks are nearby and can carry water?
all_trucks = getTrucksNearby(scenario_start_place)
number_of_available_trucks = len(all_trucks)
print("available trucks = {:d}".format(number_of_available_trucks))


for item in routes:
	route = item["value"]

	print("\n\n--------- past route for training: {:s} ---------".format(item["id"]))
	print(route)
	print("---------")

	
	# what kind of disaster does this route address?
	scenario = getScenario(route)

	# how far away was the truck from the target delivery site?
	# this includes any detour to pickup supplies
	distance = getDistanceStartToFinish(route)


	# how was this route scored by relief workers in the past?
	rating = getQualityRating(route)