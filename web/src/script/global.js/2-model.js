var LX = window.LX || {};
window.LX = LX;

LX.Model = (function() {

	var db_host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com";
	var web_host = window.location.host.replace(":3000", ":8080")
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

	self.getFakeMessages = function() {
		return [
			{
				"me": false,
				"text": "Good morning! We have 49 unattended requests for supplies in the Greater Boston Area."
			},
			{
				"me": true,
				"text": "categorize please"
			},
			{
				"me": false,
				"text": "Sure. At this moment, the most needed supply is Water and fastest growing need is Clothing."
			},
			{
				"me": true,
				"text": "ok, fresh drinking water just arrived at Fenway"
			},
			{
				"me": false,
				"text": "I recommend dispatch to Roxbury. This area is at highest risk and there is a volunteer driver near you."
			},
			{
				"me": true,
				"text": "show suggested route avoiding flood risk"
			}
		];
	}
	//----------------------------------------------------------------- Conversational

	self.sendMessage = function(text) {
		return fetch("http://"+web_host+"/api/message", {
        		method: "POST",
        		cors: true, 
        		headers: {
      				"Accept": "application/json",
      				"Content-Type": "application/json"
    			},
        		body: JSON.stringify({"text": text})
			})
			.then(function(response) {
			  	return response.json();
			})
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