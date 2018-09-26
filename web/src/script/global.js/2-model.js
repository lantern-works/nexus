var LX = window.LX || {};
window.LX = LX;

LX.Model = (function() {

	var db_host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com";
	var web_host = window.location.host.replace(":3000", ":8080")
	var self = {
		history: []
	};



	//----------------------------------------------------------------- Pre-defined Data
	self.getFilterTypes = function() {
		return [
			{"id": "vehicle", "name": "Vehicles", "active": true},
			{"id": "place", "name": "Places", "active": true},
			{"id": "device", "name": "Devices", "active": true},
			{"id": "route", "name": "Routes", "active": true},
			{"id": "request", "name": "Requests", "active": true},
			{"id": "fire", "name": "Fires"}
		];
	}

	self.getUnitedStatesGeohash = function() {
		return ["9z", "dn", "c8", "fo"];
	}

	

	//----------------------------------------------------------------- Conversational
	function postToAPI(route, data) {
		var json_data = JSON.stringify(data);
		return fetch(window.location.protocol + "//" + web_host + "/api/" + route, {
        		method: "POST",
        		cors: true, 
        		headers: {
      				"Accept": "application/json",
      				"Content-Type": "application/json"
    			},
        		body: json_data
			})
			.then(function(response) {
			  	return response.json();
			})
	}

	self.sendMessage = function(text) {
		if (!text) {
			console.log("[model] skip empty message send");
			return Promise.resolve();
		}
		self.history.push(text);
		return postToAPI("message", {"text": text});
	}

	self.getLocationsFromName = function(text) {
		return postToAPI("geocode", {"text": text});
	}

	self.getNamesFromLocation = function(pos) {
		return postToAPI("reverse_geocode", {
			"latitude": pos.coords.latitude,
			"longitude": pos.coords.longitude 
		});
	}


	self.getNamesFromGeohash = function(geohash) {
		var latlon = Geohash.decode(geohash);
		return postToAPI("reverse_geocode", {
			"latitude": latlon.lat,
			"longitude": latlon.lon
		});
	}



	//----------------------------------------------------------------- Database Interactions
	self.getDatabase = function(name, username, password, host) {
		var db_uri = window.location.protocol + "//" + (host || db_host) +"/"+name;
		if (username && password) {
			db_uri = db_uri.replace("://", "://"+username+":"+password+"@");
		}
		return new PouchDB(db_uri);
	}

	self.db = {};
	self.db.network = self.getDatabase("lnt", null, null, "lantern.global");
	self.db.weather = self.getDatabase("lantern-nexus");



	//----------------------------------------------------------------- Document Access

	self.findActiveEvents = function() {
		return self.db.network.query("event/by_status", {
			key: 1,
		});
	}

	self.findPendingRequests = function(geohash) {
		return self.db.network.query("request/by_geo", {
		});
	}


	self.findRoutes = function(geo_prefix) {
		return self.db.network.query("route/by_geo", {
			startkey: geo_prefix,
			endkey: geo_prefix +"\ufff0"
		});
	}

	self.findPlaces = function() {
		return self.db.network.query("venue/by_geo", {
			startkey: ["bld"],
			endkey: ["tmp", {}]
		});
	}

	self.findVehicles = function() {
		return self.db.network.query("venue/by_geo", {
			startkey: ["trk"],
			endkey: ["trk", "\ufff0"]
		});
	}

	self.findDevices = function(geo_prefix) {
		return self.db.network.query("device/by_geo", {
			startkey: geo_prefix,
			endkey: geo_prefix +"\ufff0"
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