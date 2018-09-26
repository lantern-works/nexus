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
		"_id": "e:hurricane_florence_82FCD",
		"tt": "Hurricane Florence",
		"st": 1, # complete
		"gp": ["djzqj"],
		"ct": ["hrc"],
		"$ca": moment.utc(2018, 9, 13).strftime("%Y-%m-%dT%H:%M:%S")
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




rvh = addVenue("Ridge View High School", id="rvh", lat=34.1630921, lon=-80.910353, cat="bld", parents=[1])

pbe = addVenue("Palmetto Bays Elementary School", id="pbe", lat=33.7301615, lon=-79.0228992, cat="bld", parents=[1])


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
addItem(venue=rvh, cat="bed", event=events[0])
addItem(venue=rvh, cat="net", event=events[0])
addItem(venue=rvh, cat="wtr", event=events[0])
addItem(venue=pbe, cat="bed", event=events[0])
addItem(venue=pbe, cat="eat", event=events[0])


#--------------------------------------------------------------------------------

# run desired database population
#generateEvents()
generateVenues()
generateItems()