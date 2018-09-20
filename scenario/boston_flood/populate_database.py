from lib.database import db,server
import json,pprint,moment,random,time
import pygeohash as pg

# pretty print
pp = pprint.PrettyPrinter(depth=6)

# setup now for json 
first = moment.utc(2018, 1, 5)
then = moment.utc(2018, 7, 17)
now = moment.utcnow()

#--------------------------------------------------------------------------------

def saveDoc(doc):
	try:
		existing_doc = db.get(doc['_id'])
		doc['_rev'] = existing_doc['_rev']
	except:
		print("New document. Saving...")
	return db.save(doc)


print("connected to server...")
print(server.info())

#--------------------------------------------------------------------------------
print("\n\ngenerating storm events...\n")


events = [
	{
		"_id": "e:boston_X8E29",
		"st": 3, # complete
		"gp": ["drt2z"],
		"ct": ["fld"],
		"$ca": then.strftime("%Y-%m-%dT%H:%M:%S")
	},
	{
		"_id": "e:boston_19EC4",
		"st": 3, # complete
		"gp": ["drt2z"],
		"ct": ["fld"],
		"$ca": then.strftime("%Y-%m-%dT%H:%M:%S")
	},
	{
		"_id": "e:boston_D392F",
		"gp": ["drt2z"],
		"st": 1, # active
		"ct": ["fld"],
		"$ca": now.strftime("%Y-%m-%dT%H:%M:%S")
	}
]

for event in events:
	pp.pprint(event)
	saveDoc(event)

exit()

#--------------------------------------------------------------------------------
print("\n\ngenerating venues...\n")

venues = []

def addVenue(title, id=None, lat=None, lon=None, cat=None, parents=[]):
	venue = {
		"_id": "v:"+id,
		"st": 1, # open venue
		"pt": [],
		"tt": title,
		"ct": [cat],
		"gp": [pg.encode(lat, lon)],
		"$ca": ""
	}

	for x in parents:
		if not venue['$ca']:
			venue['$ca'] = events[x-1]['$ca']
		venue['pt'].append(events[x-1]['_id'])

	venues.append(venue)

	return venue

fen = addVenue("Fenway Park", id="fen", lat=42.345829, lon=-71.096882, cat="tmp", parents=[1,2,3])
frn = addVenue("Franklin Park", id="frn", lat=42.313245, lon=-71.095177, cat="tmp", parents=[1,2,3])
bwf = addVenue("Whole Foods", id="bwf", lat=42.3429892, lon=-71.0910806, cat="bld", parents=[2,3])
bwt = addVenue("Boston Water Truck", id="bwt", lat=42.3466703, lon=-71.094841, cat="trk", parents=[3])

for venue in venues:
	pp.pprint(venue)
	saveDoc(venue)




#--------------------------------------------------------------------------------
print("\n\ngenerating items...\n")

items = []

def addItem(venue=[],cat="", event=None):

	item = {
		"_id": ":".join(["i", cat, event['_id'], venue['_id']]),
		"st": 1, # available supply item
		"ct": [ cat ],
		"pt": [ venue['_id'], event['_id']],
		"$ca": event['$ca']
	}
	items.append(item)
	return item

# add supplies for current storm event
addItem(venue=fen, cat="bed", event=events[2])
addItem(venue=fen, cat="pwr", event=events[2])
addItem(venue=bwf, cat="wtr", event=events[2])
addItem(venue=bwf, cat="eat", event=events[2])


addItem(venue=bwf, cat="wtr", event=events[1])

addItem(venue=bwf, cat="wtr", event=events[0])


for item in items:
	pp.pprint(item)
	saveDoc(item)



#--------------------------------------------------------------------------------
print("\n\ngenerating routes...\n")

routes = []

simulated_route_points = [
	 [42.339320, -71.0803250],
	 [42.315772, -71.098237],
	 [42.343967, -71.089956],
	 [42.336952, -71.093588],
	 [42.334570, -71.089572],
	 [42.339503, -71.092514],
	 [42.338508, -71.092684],
	 [42.326420, -71.100212],
	 [42.313336, -71.095117]
]

def addRoute(id, event=None, from_venue=None, to_venue=None):

	path = [from_venue['gp'][0]]
	stops = random.randint(2,5)

	for x in range(stops):
		rand_index = random.randint(0,len(simulated_route_points)-1)
		rand_point = simulated_route_points[rand_index]
		rand_geo = pg.encode(rand_point[0], rand_point[1])
		path.append(rand_geo)

	path.append(to_venue['gp'][0])

	route = {
		"_id": ":".join(["r", id, event['_id']]),
		"gp": path,
		"pt": [event['_id']],
		"fr": from_venue['_id'],
		"to": to_venue['_id'],
		"$ca": event["$ca"]
	}

	if event["st"] == 3:
		# complete events might have quality scores for routes that finished
		route["rt"] = random.randint(1,100)
		
	routes.append(route)
	return route

# add routes for current storm event


for x in range(1000):
	addRoute(str(x), events[0], from_venue=fen, to_venue=frn)

for x in range(1000):
	addRoute(str(x), events[1], from_venue=fen, to_venue=frn)

for x in range(10):
	addRoute(str(x), events[2], from_venue=fen, to_venue=frn)

for route in routes:
	pp.pprint(route)
	time.sleep(0.1)
	saveDoc(route)



