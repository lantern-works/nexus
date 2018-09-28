import moment
import lib.database as db



#-------------------------------------------------------------------------------- Events
charlie_fire = db.addEvent("Charlie Fire", 
		id="cali_fire_F98E2", 
		geohash="9q5sj",
		status=1,
		cat="fre", 
		created_at=moment.utc(2018, 9, 22).strftime("%Y-%m-%dT%H:%M:%S")
	)



#-------------------------------------------------------------------------------- Venues
spl = db.addVenue("Castaic Animal Shelter", id="cas", lat=34.4878525, lon=-118.6179135, cat="bld", parents=[charlie_fire])
scf = db.addVenue("Castaic Sports Complex", id="scf", lat=34.4860455, lon=-118.6169076, cat="bld", parents=[charlie_fire])




#-------------------------------------------------------------------------------- Items
db.addItem(venue=spl, cat="bed", event=charlie_fire)
db.addItem(venue=scf, cat="bed", event=charlie_fire)



#-------------------------------------------------------------------------------- Save
# db.saveAll("venue")
# db.saveAll("item")