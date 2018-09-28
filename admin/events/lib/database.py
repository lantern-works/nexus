import pycouchdb,pprint
import json,random,time
import pygeohash as pg

# used to generate geohash variations
__base32 = '0123456789bcdefghjkmnpqrstuvwxyz'


uri = "https://lantern.global"
server = pycouchdb.Server(uri, verify=True)
db = server.database("lnt")

key_map = {
	"v": "venues",
	"r": "routes",
	"i": "items",
	"q": "request",
	"e": "event",
	"d": "device"
}

docs = {
	"venue": [],
	"item": [],
	"route": [],
	"event": [],
	"request": [],
	"device": []
}

# pretty print
pp = pprint.PrettyPrinter(depth=6)



def saveAll(kind):
	print("\n\ngenerating " + kind + "...\n")
	for doc in docs[kind]:
		pp.pprint(doc)
		saveDoc(doc,resave=False)


def saveDoc(doc,resave=False):
	try:
		existing_doc = db.get(doc['_id'])
		if resave:
			doc['_rev'] = existing_doc['_rev']
		else:
			print("Existing doc. Skipping...")
			return
	except:
		print("New document. Saving...")
	return db.save(doc)


def addItem(venue=[],cat="", event=None):

	item = {
		"_id": ":".join(["i", cat, event['_id'], venue['_id']]),
		"st": 1, # available supply item
		"ct": [ cat ],
		"pt": [ venue['_id'], event['_id']],
		"$ca": event['$ca']
	}
	docs["item"].append(item)
	return item


def addEvent(title, id=None, geohash=None, cat=None, created_at=None, status=0):
	event = {
		"_id": "e:" + id,
		"tt": title,
		"st": status,
		"gp": [geohash],
		"ct": [cat],
		"$ca": created_at
	}
	docs["event"].append(event)
	return event


def addDevice(title, id=None, geohash=None, cat=None, created_at=None, status=1):
	device = {
		"_id": "e:" + id,
		"tt": title,
		"st": status,
		"gp": [geohash],
		"ct": [cat],
		"$ca": created_at
	}
	docs["device"].append(device)
	return device


def addRequest(id=None, event=None, cat=None):

	possible_geo = ["drt2y", "drt2w","drt2w", "drt2w", "drt2v"]
	base_geo = random.choice(possible_geo)
	print("starting at geo center:" + base_geo)
	geo = base_geo + random.choice(__base32) + random.choice(__base32) + random.choice(__base32)
	if cat != "wtr":
		id = cat + ":" + id
	request = {
		"_id": "q:"+id,
		"st": 0, #unfulfilled / pending request
		"ct": [cat],
		"gp": [geo],
		"rt": random.randint(1,100)
	}
	docs["request"] = request
	return request


	

def addRoute(id, event=None, from_venue=None, to_venue=None):

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


	route["st"] = event["st"]

	if event["st"] == 3:
		# complete events might have quality scores for routes that finished
		route["rt"] = random.randint(1,100)
		
	docs["route"].append(route)
	return route



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

	for parent in parents:
		print(parent)
		if not venue['$ca']:
			venue['$ca'] = parent['$ca']
		venue['pt'].append(parent['_id'])

	docs["venue"].append(venue)

	return venue
