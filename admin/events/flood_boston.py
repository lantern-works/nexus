import moment
import lib.database as db

# setup now for json 
first = moment.utc(2018, 1, 5)
then = moment.utc(2018, 7, 17)
now = moment.utcnow()


#-------------------------------------------------------------------------------- Events
first_flood = db.addEvent("First Boston Flood", 
		id="boston_X8E29", 
		geohash="drt2z", 
		cat="fld", 
		status=3,
		created_at=first.strftime("%Y-%m-%dT%H:%M:%S")
	)

second_flood = db.addEvent("Second Boston Flood", 
		id="boston_19EC4", 
		geohash="drt2z", 
		cat="fld",
		status=3,
		created_at=then.strftime("%Y-%m-%dT%H:%M:%S")
	)

active_flood = db.addEvent("Boston Flood", 
		id="boston_D392F", 
		geohash="drt2z", 
		cat="fld", 
		status=1,
		created_at=now.strftime("%Y-%m-%dT%H:%M:%S")
	)



#-------------------------------------------------------------------------------- Devices
l1 = db.addDevice("L1B", id="boston_l1", geohash="drt2w3hk", created_at=now.strftime("%Y-%m-%dT%H:%M:%S"))
l2 = db.addDevice("L2B", id="boston_l2", geohash="drt2wn9n", created_at=now.strftime("%Y-%m-%dT%H:%M:%S"))
l3 = db.addDevice("L3B", id="boston_l3", geohash="drt2v2dn", created_at=now.strftime("%Y-%m-%dT%H:%M:%S"))
l4 = db.addDevice("L4B", id="boston_l4", geohash="drt2dd", created_at=now.strftime("%Y-%m-%dT%H:%M:%S"))
l5 = db.addDevice("L5B", id="boston_l5", geohash="drt2zd", created_at=now.strftime("%Y-%m-%dT%H:%M:%S"))



#-------------------------------------------------------------------------------- Venues
spl = db.addVenue("Sommerville Public Library", id="spl", lat=42.3847231, lon=-71.0958602, cat="bld", parents=[second_flood,active_flood])
jmp = db.addVenue("Joe Moakley Park", id="jmp", lat=42.322418, lon=-71.050986, cat="prk", parents=[active_flood])
psc = db.addVenue("Park Street Chuch", id="psc", lat=42.3566598, lon=-71.065598, cat="bld", parents=[first_flood,second_flood,active_flood])
fen = db.addVenue("Fenway Park", id="fen", lat=42.345829, lon=-71.096882, cat="prk", parents=[first_flood,second_flood,active_flood])
frn = db.addVenue("Franklin Park", id="frn", lat=42.313245, lon=-71.095177, cat="prk", parents=[first_flood,second_flood,active_flood])
bwf = db.addVenue("Whole Foods", id="bwf", lat=42.3429892, lon=-71.0910806, cat="bld", parents=[second_flood, active_flood])
bwt = db.addVenue("Boston Water Truck", id="bwt", lat=42.3466703, lon=-71.094841, cat="trk", parents=[active_flood])
mst = db.addVenue("Medical Supply Truck", id="mst", lat=42.353157, lon=-71.122934, cat="trk", parents=[active_flood])
djv = db.addVenue("Donations Jeep", id="djv", lat=42.304363, lon=-71.115425, cat="trk", parents=[active_flood])
djt = db.addVenue("Donations Truck", id="djt", lat=42.293899, lon=-71.062877, cat="trk", parents=[active_flood])



#--------------------------------------------------------------------------------

def makeRequestId(x):
	return (str(x) + ":" + active_flood["_id"])

for x in range(49):
	db.addRequest(id=makeRequestId(x), cat="wtr", event=active_flood)

for x in range(5):
	db.addRequest(id=makeRequestId(x), cat="ful", event=active_flood)

for x in range(12):
	db.addRequest(id=makeRequestId(x), cat="clo", event=active_flood)

for x in range(2):
	db.addRequest(id=makeRequestId(x), cat="net", event=active_flood)



#-------------------------------------------------------------------------------- Items
db.addItem(venue=bwf, cat="wtr", event=first_flood)
db.addItem(venue=bwf, cat="wtr", event=second_flood)
db.addItem(venue=fen, cat="bed", event=active_flood)
db.addItem(venue=fen, cat="pwr", event=active_flood)
db.addItem(venue=bwf, cat="wtr", event=active_flood)
db.addItem(venue=bwf, cat="eat", event=active_flood)
db.addItem(venue=jmp, cat="clo", event=active_flood)
db.addItem(venue=psc, cat="eat", event=active_flood)
db.addItem(venue=psc, cat="med", event=active_flood)
db.addItem(venue=bwt, cat="wtr", event=active_flood)
db.addItem(venue=frn, cat="bed", event=active_flood)
db.addItem(venue=frn, cat="wtr", event=active_flood)
db.addItem(venue=spl, cat="net", event=active_flood)




#-------------------------------------------------------------------------------- Routes
for x in range(1000):
	db.addRoute(str(x), first_flood, from_venue=fen, to_venue=frn)
for x in range(1000):
	db.addRoute(str(x), second_flood, from_venue=fen, to_venue=frn)
for x in range(10):
	db.addRoute(str(x), active_flood, from_venue=fen, to_venue=frn)




#-------------------------------------------------------------------------------- Save
# db.saveAll("venue")
# db.saveAll("item")
# db.saveAll("route")
# db.saveAll("request")

