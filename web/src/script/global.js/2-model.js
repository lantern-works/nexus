var LX = window.LX || {};
window.LX = LX;

LX.Model = (function() {

	var db_host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
	var self = {};



	//----------------------------------------------------------------- Pre-defined Data
	self.getWeatherTypes = function() {
		return [
			{"id": "fire", "name": "Fires"},
			{"id": "place", "name": "Places"},
			{"id": "vehicle", "name": "Vehicles"}
		];
	}

	self.getUnitedStatesGeohash = function() {
		return ["9z", "dn", "c8", "fo"];
	}

	//----------------------------------------------------------------- Database Interactions
	self.getDatabase = function(name, username, password) {
		var db_uri = "https://"+db_host+"/"+name;
		if (username && password) {
			db_uri = db_uri.replace("://", "://"+username+":"+password+"@");
		}
		console.log(db_uri);
		return new PouchDB(db_uri);
	}

	self.db = {};
	self.db.network = self.getDatabase("lantern-us-demo");
	self.db.weather = self.getDatabase("lantern-nexus");



	//----------------------------------------------------------------- Document Access
	self.findPlaces = function() {
		return self.db.network.query("venue/by_geo", {
			startkey: ["bld"],
			endkey: ["tmp"]
		});
	}

	self.findVehicles = function() {
		return self.db.network.query("venue/by_geo", {
			startkey: ["trk"],
			endkey: ["trk", "\ufff0"]
		});
	}

	self.findWeather = function(id, geo_prefix) {
		return self.db.weather.query(id+"/by_geo", {
			startkey: geo_prefix,
			endkey: geo_prefix+"\ufff0",
			reduce: true, 
			group: true
		});
	}


	//-----------------------------------------------------------------
	return self;
})();