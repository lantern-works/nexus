from lib.database import db,server
import json,pprint,moment,random,time
import pygeohash as pg

# used to generate geohash variations
__base32 = '0123456789bcdefghjkmnpqrstuvwxyz'

# pretty print
pp = pprint.PrettyPrinter(depth=6)

#--------------------------------------------------------------------------------

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


print("connected to server...")
print(server.info())

#--------------------------------------------------------------------------------

events = [
	{
		"_id": "e:cali_fire_F98E2",
		"tt": "Charlie Fire",
		"st": 1, # complete
		"gp": ["9q5sj"],
		"ct": ["fre"],
		"$ca": moment.utc(2018, 9, 22).strftime("%Y-%m-%dT%H:%M:%S")
	}
]


def generateEvents():
	print("\n\ngenerating storm events...\n")
	for event in events:
		pp.pprint(event)
		saveDoc(event,True)

#--------------------------------------------------------------------------------

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

def generateVenues():
	print("\n\ngenerating venues...\n")

	for venue in venues:
		pp.pprint(venue)
		saveDoc(venue, resave=True)




spl = addVenue("Castaic Animal Shelter", id="cas", lat=34.4878525, lon=-118.6179135, cat="bld", parents=[1])

scf = addVenue("Castaic Sports Complex", id="scf", lat=34.4860455, lon=-118.6169076, cat="bld", parents=[1])


#--------------------------------------------------------------------------------
def generateItems():
	print("\n\ngenerating items...\n")

	for item in items:
		pp.pprint(item)
		saveDoc(item)

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
addItem(venue=spl, cat="bed", event=events[0])
addItem(venue=scf, cat="bed", event=events[0])



#--------------------------------------------------------------------------------

# run desired database population
#generateEvents()
generateVenues()
generateItems()