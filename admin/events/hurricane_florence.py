import moment
import lib.database as db


#-------------------------------------------------------------------------------- Events
florence = db.addEvent("Hurricane Florence", 
		id="hurricane_florence_82FCD", 
		geohash="djzqj", 
		cat="hrc", 
		status=1,
		created_at=moment.utc(2018, 9, 13).strftime("%Y-%m-%dT%H:%M:%S")
	)



#-------------------------------------------------------------------------------- Venues
rvh = db.addVenue("Ridge View High School", id="rvh", lat=34.1630921, lon=-80.910353, cat="bld", parents=[florence])
pbe = db.addVenue("Palmetto Bays Elementary School", id="pbe", lat=33.7301615, lon=-79.0228992, cat="bld", parents=[florence])



#-------------------------------------------------------------------------------- Items
# add supplies for current storm event
db.addItem(venue=rvh, cat="bed", event=florence)
db.addItem(venue=rvh, cat="net", event=florence)
db.addItem(venue=rvh, cat="wtr", event=florence)
db.addItem(venue=pbe, cat="bed", event=florence)
db.addItem(venue=pbe, cat="eat", event=florence)

