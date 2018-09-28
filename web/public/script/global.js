__base = "../";

/*
https://github.com/danwild/leaflet-fa-markers
Copyright 2017 Daniel Wild danwild@y7mail.com
http://www.apache.org/licenses/LICENSE-2.0
*/


L.Icon.FontAwesome = L.Icon.extend({

    options: {
        popupAnchor: [0, -50]
    },

    createIcon: function () {

        var div = document.createElement('div');
        var options = this.options;

        if(options.iconClasses) {
            div.appendChild(this._createIcon());
        }

        return div;
    },

    _createIcon: function () {

        var options = this.options;

        // container div
        var iconDiv = L.DomUtil.create('div', 'leaflet-fa-markers');

        // feature icon
        var iconSpan = L.DomUtil.create('span', options.iconClasses + ' feature-icon');
        iconSpan.style.color = options.iconColor;
        iconSpan.style.textAlign = 'center';
        iconSpan.style.backgroundColor = options.markerColor;
        iconSpan.style.borderColor = options.markerStroke;

        // XY position adjustments
        if(options.iconYOffset && options.iconYOffset != 0) iconSpan.style.marginTop = options.iconYOffset + 'px';
        if(options.iconXOffset && options.iconXOffset != 0) iconSpan.style.marginLeft = options.iconXOffset + 'px';

        // marker icon L.DomUtil doesn't seem to like svg, just append out html directly
        var markerSvg = document.createElement('div');
        markerSvg.className = "marker-icon-svg";
        markerSvg.innerHTML = '<svg ' +
            'width="32px" ' +
            'height="52px" ' +
            'viewBox="0 0 32 52" ' +
            'version="1.1" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path fill="' + options.markerColor + '" d="'+options.markerPath+'" "></path>' +
            '</svg>';


        iconDiv.appendChild(markerSvg);
        iconDiv.appendChild(iconSpan);
        return iconDiv;
    }
});

L.icon.fontAwesome = function (options) {
    return new L.Icon.FontAwesome(options);
};

L.Icon.FontAwesome.prototype.options.markerPath = 'M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z';




L.Icon.FontAwesomeCircle = L.Icon.extend({

    options: {
        popupAnchor: [0, -50]
    },

    createIcon: function () {

        var div = document.createElement('div');
        var options = this.options;

        if(options.iconClasses) {
            div.appendChild(this._createIcon());
        }

        return div;
    },

    _createIcon: function () {

        var options = this.options;

        // container div
        var iconDiv = L.DomUtil.create('div', 'leaflet-fa-markers leaflet-fa-markers-circle');

        // feature icon
        var iconSpan = L.DomUtil.create('span', options.iconClasses + ' feature-icon');
        iconSpan.style.color = options.iconColor;
        iconSpan.style.textAlign = 'center';
        iconSpan.style.borderColor = options.markerStroke;

        if(options.markerColor) {
            iconSpan.style.backgroundColor = options.markerColor;
        }



        // XY position adjustments
        if(options.iconYOffset && options.iconYOffset != 0) iconSpan.style.marginTop = options.iconYOffset + 'px';
        if(options.iconXOffset && options.iconXOffset != 0) iconSpan.style.marginLeft = options.iconXOffset + 'px';

        // marker icon L.DomUtil doesn't seem to like svg, just append out html directly
        var markerSvg = document.createElement('div');
        markerSvg.className = "marker-icon-svg-circle";
        markerSvg.innerHTML = '<svg ' +
            'width="32px" ' +
            'height="52px" ' +
            'viewBox="0 0 32 52" ' +
            'version="1.1" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path fill="' + options.markerColor + '" fill-opacity="0.0" d="'+options.markerPath+'" "></path>' +
            '</svg>';


        iconDiv.appendChild(markerSvg);
        iconDiv.appendChild(iconSpan);
        return iconDiv;
    }
});

L.icon.fontAwesomeCircle = function (options) {
    return new L.Icon.FontAwesomeCircle(options);
};

function getPath(cx,cy,r){
  return "M" + cx + "," + cy + "m" + (-r) + ",0a" + r + "," + r + " 0 1,0 " + (r * 2) + ",0a" + r + "," + r + " 0 1,0 " + (-r * 2) + ",0";
}

L.Icon.FontAwesomeCircle.prototype.options.markerPath =  'M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z';


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
			{"id": "flood", "name": "Flood", "active": true},
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
var LX = window.LX || {};
window.LX = LX;

LX.Map = (function(onClick) {

    var category_icon_map = {
        "wtr": "tint",
        "ful": "gas-pump",
        "net": "globe",
        "med": "prescription-bottle-alt",
        "clo": "tshirt",
        "pwr": "plug",
        "eat": "utensils",
        "bed": "bed"
    }

    var category_icon_color = {
        "wtr": "78aef9",
        "ful": "c075c9",
        "net": "73cc72",
        "med": "ff844d",
        "clo": "50c1b6",
        "pwr": "f45d90",
        "eat": "ffcc54",
        "bed": "FFB000"
    }

    
	var self = {
		_map: L.map('map').setView([38.42,-102.79], 4),
        layers: {},
        show: {},
        hide: {},
        focus: {}
	};


    LX.Model.getFilterTypes().forEach(function(type) {
        self.layers[type.id] = {};
    });


    //----------------------------------------------------------------- Helpers
    function initLayerGroup(key, subkey) {
        if (!self.layers[key].all) {
            self.layers[key].all = L.layerGroup();
        }

        if (subkey && !self.layers[key][subkey]) {
            self.layers[key][subkey] = L.layerGroup();
        }
    }

    function hasLayerData(key, subkey) {
        if (subkey) {
            return self.layers[key][subkey].getLayers().length   
        }
        else {
            return self.layers[key].all.getLayers().length;
        }
    }

    //----------------------------------------------------------------- Basic Map Functions
    // @todo be smarter about scope so we don't need new functions

    self.getZoom = function() {
        return self._map.getZoom();
    }

    self.setZoom = function(val) {
        self._map.setZoom(val);
    }

    self.setView = function(coords, zoom_level) {
        self._map.setView(coords, zoom_level);
    };



    //----------------------------------------------------------------- Render

    self.render = function(svg) {


        var uri = "https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/voyager/";

        var tiles, uri, opts;

        console.log("[map] render and center on united states");
        
        opts = {
            attribution: false,
            maxZoom: 16,
            crossOrigin: true,
            accessToken: 'not-needed',
        }  
        if (svg) {
            opts.style = uri + "/style.json?key=ZokpyarACItmA6NqGNhr";
            tiles = L.mapboxGL(opts)
        }
        else {
            tiles = L.tileLayer(uri+"{z}/{x}/{y}.png?key=ZokpyarACItmA6NqGNhr", opts)
        }
        tiles.addTo(self._map);
    }


    //----------------------------------------------------------------- Device Layers

    function showDevice(row, layer_group) {
        var latlon = Geohash.decode(row.key);
        var opts = {};
        var icon = "broadcast-tower";

        console.log(latlon)
        opts.icon = L.icon.fontAwesome({ 
            iconClasses: 'fa fa-'+icon,
            markerColor: "#3273dc",
            iconColor: '#FFF'
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);

        marker.on("click", function(e) {
            onClick(row.value);
        });
    }


    self.show.device = function() {
        console.log("[map] show device");
        initLayerGroup("device");

        if (!hasLayerData("device")) {
            LX.Model.findDevices()
                .then(function(response) {
                    console.log(response)
                    response.rows.forEach(function(row) {
                        showDevice(row, self.layers.device.all);
                    });
                });
        }

        self._map.addLayer(self.layers.device.all);
    }


    self.hide.device = function() {
        console.log("[map] hide device");
        self._map.removeLayer(self.layers.device.all);
    }


    self.focus.device = function() {
        self.layers.device.all.bringToFront();

    }



    //----------------------------------------------------------------- Place Layers

    function showPlace(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        var icon = "flag";
        opts.icon = L.icon.fontAwesome({ 
            iconClasses: 'fa fa-'+icon,
            markerColor: "#4E535D",
            iconColor: '#FFF'
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);

        marker.on("click", function(e) {
            onClick(row.value);
        });


    }



    self.show.place = function() {
        console.log("[map] show place");
        initLayerGroup("place");


        if (!hasLayerData("place")) {
            LX.Model.findPlaces()
                .then(function(response) {
                    response.rows.forEach(function(row) {
                        showPlace(row, self.layers.place.all);
                    });
                });
        }

        self._map.addLayer(self.layers.place.all);
    }


    self.hide.place = function() {
        console.log("[map] hide place");
        self._map.removeLayer(self.layers.place.all);
    }




   //----------------------------------------------------------------- Route Layers

    self.showOneRoute = function(route) {


        // var layer_group = self.layers["route"].all;

        // console.log("LAYER GROUP", layer_group);

        var latlngs = [];
        route.gp.forEach(function(geo) {
            latlngs.push(Geohash.decode(geo));
        });

        console.log("SHOWING ROUTE", latlngs);

        var control = L.Routing.control({
            waypoints: latlngs,
            routeWhileDragging: true
        });

        control.addTo(self._map);


    }

    self.show.route = function() {
        console.log("[map] show route layer");
        initLayerGroup("route");
        self._map.addLayer(self.layers.route.all);
    }


    self.hide.vehicle = function() {
        console.log("[map] hide route");
        self._map.removeLayer(self.layers.route.all);
    }


    //----------------------------------------------------------------- Vehicle Layers

    function showVehicle(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        var icon = "truck";
        opts.icon = L.icon.fontAwesomeCircle({ 
            iconClasses: 'fa fa-'+icon,
            markerColor: "#6FB1FA",
            iconColor: '#FFF',
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);


        marker.on("click", function(e) {
            onClick(row.value);
        });

    }


    self.show.vehicle = function() {
        console.log("[map] show vehicle");
        initLayerGroup("vehicle");

        if (!hasLayerData("vehicle")) {
            LX.Model.findVehicles()
                .then(function(response) {
                    response.rows.forEach(function(row) {
                        showVehicle(row, self.layers.vehicle.all);
                    });
                });
        }

        self._map.addLayer(self.layers.vehicle.all);
    }


    self.hide.vehicle = function() {
        console.log("[map] hide vehicle");
        self._map.removeLayer(self.layers.vehicle.all);
    }


    //----------------------------------------------------------------- Request Layers

    function showRequest(row, layer_group) {
        var latlon = Geohash.decode(row.value.gp[0]);
        var opts = {};
        var icon = category_icon_map[row.value.ct[0]];
        var color = category_icon_color[row.value.ct[0]];

        opts.icon = L.icon.fontAwesomeCircle({ 
            iconClasses: 'fa fa-'+icon,
            iconColor: "#"+color,
            markerStroke:"#"+color
        });
        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);



        marker.on("click", function(e) {
           onClick(row.value);
        });
        
    }

    self.show.request = function() {

        console.log("[map] show requests");
        initLayerGroup("request");

        if (!hasLayerData("request")) {

            LX.Model.findPendingRequests().then(function(response) {
                response.rows.forEach(function(row) {
                    showRequest(row, self.layers.request.all);
                });

            });
        }

        self._map.addLayer(self.layers.request.all, true);

    }

    self.hide.request = function() {
        console.log("[map] hide requests");
        self._map.removeLayer(self.layers.request.all);
    }

   


    //----------------------------------------------------------------- Fire Layers

    function showFire(row, layer_group) {

        //console.log("[map] draw region at %s with scale of %s", row.key, row.value);
        var latlon = Geohash.decode(row.key);

        var opts = {
            color: "red",
            radius: 200*row.value
        }

        var circle = L.circle(latlon, opts)
        layer_group.addLayer(circle).addTo(self._map);
        circle.bringToBack();
    }



    self.show.fire = function() {

        console.log("[map] show fire");

        // @todo united states and nearby only for now
        LX.Model.getUnitedStatesGeohash().forEach(function(gh) {
            
            initLayerGroup("fire", gh);

            if (!hasLayerData("fire", gh)) {
                console.log("[map] looking for fire:" +  gh)
                LX.Model.findWeather("fire", gh)
                    .then(function(response) {
                        response.rows.forEach(function(row) {
                            showFire(row, self.layers.fire[gh]);
                        });
                    });
            }
            
            self._map.addLayer(self.layers.fire[gh]);
            
        });
    }

    self.hide.fire = function() {
        console.log("[map] hide fire");
        for (var idx in self.layers.fire) {
            self._map.removeLayer(self.layers.fire[idx]);
        }
    }





    //----------------------------------------------------------------- Flood Layers

    // @todo lewverage weather data as with fire
    function showFlood() {


        var bounds = L.latLngBounds([[ 42.35298925, -71.12], [42.33221, -71.10]]);
        var overlay = L.imageOverlay("/style/flood.png", bounds, {} );
        overlay.addTo(self._map);


        var bounds = L.latLngBounds([[ 42.32, -71.05], [42.31221, -71.03]]);
        var overlay2 = L.imageOverlay("/style/flood2.png", bounds, {} );
        overlay2.addTo(self._map);
    }



    self.show.flood = function() {

        console.log("[map] show flood");

        // @todo united states and nearby only for now
        LX.Model.getUnitedStatesGeohash().forEach(function(gh) {
            
            initLayerGroup("flood", gh);

            if (!hasLayerData("flood", gh)) {
                console.log("[map] looking for flood:" +  gh)
                showFlood();
            }
            
            self._map.addLayer(self.layers.flood[gh]);
            
        });
    }

    self.hide.flood = function() {
        console.log("[map] hide flood");
        for (var idx in self.layers.flood) {
            self._map.removeLayer(self.layers.flood[idx]);
        }
    }

	return self;

});
var LX = window.LX || {};
window.LX = LX;

function findObjectIndexByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return i;
        }
    }
    return null;
}

LX.View = (function() {

    var marker_types = {
        "d": "device broadcasting data",
        "i": "supply item",
        "q": "supply request",
        "v": "venue"
    }

    var category_name_map = {
        "wtr": "Water",
        "ful": "Fuel",
        "net": "Internet",
        "med": "Medical",
        "clo": "Clothing",
        "pwr": "Power",
        "eat": "Food",
        "bed": "Shelter"
    };


	var self = {
        ctx: {
            coords: [],
            geohash: "drt2z",
            event_type: "",
            event_name: "",
            state: null, // track conversation / map focus
            supply: null // what user has to work with at the moment
        }
    };


	//----------------------------------------------------------------- Map Interface
    function getMyLocation() {
        return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(function(position) {
                resolve(position);
            }, function(err) {
                reject(err);
            }, {
                enableHighAccuracy: false, 
                maximumAge        : 30000, 
                timeout           : 27000
            });
        });
    }

	self.map = LX.Map(function(data) {
        console.log("Clicked on map marker: ", data);
        var str = "This is a " + marker_types[data._id[0]];
        if (data.tt) {
            str += " named " + data.tt;
        }
        addBotMessage(str+".");
    });





    //----------------------------------------------------------------- Chat Interface
    function scrollChat() {
        var chat = document.getElementById('message-container'); 
        chat.scrollTop = chat.scrollHeight;
    }


    var transforms = {
        "timed_greeting": function() {

            var d = new Date();
            var time = d.getHours();

            if (time < 12)  {
                return Promise.resolve("Good morning");
            }
            else if (time > 17) {
              return Promise.resolve("Good evening");
            }
            else if (time > 12) {
              return Promise.resolve("Good afternoon");
            } 
            else if (time == 12)  {
                Promise.resolve("Good day");
            }
        },
        "active_events": function() {
            return LX.Model.findActiveEvents().then(function(results) {
                var count = results.rows.length;
                var places = [];

                var fns = [];

                results.rows.forEach(function(row) {
                    if (row.value.tt) {
                        places.push(row.value.tt)
                    }
                    else {
                        var fn = LX.Model.getNamesFromGeohash(row.value.gp[0]).then(function(names) {
                            if (names.results[0].city) {
                                places.push(names.results[0].city);                            
                            }
                            else {
                                places.push(names.results[0].county);
                            }
                        });
                        fns.push(fn);
                    }
                });

                return Promise.all(fns).then(function() {
                    addBotMessage("You can say: " + places.join(", "), 300);
                    return [count, "active", (count == 1 ? "event" : "events")].join(" ");
                });

            });
        },
        "pending_request_count": function() {
            return LX.Model.findPendingRequests(self.ctx.geohash).then(function(results) {
                // @todo filter to juse place
                var count = results.rows.length;
                return [count, "unattended", (count == 1 ? "request" : "requests"), "for supplies"].join(" ");
            })
        },
        "pending_request_count_event": function() {
            return LX.Model.findPendingRequests(self.ctx.geohash).then(function(results) {
                // @todo filter to just event
                var count = results.rows.length;
                return [count, "unattended", (count == 1 ? "request" : "requests"), "for supplies"].join(" ");
            })

        },
        "lantern_device_count": function() {
            return LX.Model.findDevices(self.ctx.geohash.substr(0,4)).then(function(results) {
                return results.rows.length;
            })
        },
        "categorized_data": function() {

            return LX.Model.findPendingRequests(self.ctx.geohash).then(function(results) {
                var tally = {};
                var flip = {};
                // @todo use map reduce for speed
                results.rows.forEach(function(row) {
                    row.value.ct.forEach(function(cat) {
                        tally[cat] = tally[cat] || 0;
                        tally[cat]++;
                    });
                });
                var most_needed = Object.keys(tally).reduce(function(a, b){ return tally[a] > tally[b] ? a : b });
                var least_needed = Object.keys(tally).reduce(function(a, b){ return tally[a] < tally[b] ? a : b });

                return Promise.resolve("the most needed supply item is " + category_name_map[most_needed] + 
                        " and least needed is " + category_name_map[least_needed]);
            });
        },
        "suggested_location": function() {
            var place_name = "Roxbury";
            if (self.ctx.state) {
                actOnLocation(place_name + " " + self.ctx.state);
            }
            return Promise.resolve(place_name);
        },
        "suggested_supply_type": function() {
            var suggestion = self.ctx.supply || "med";
            return Promise.resolve(category_name_map[suggestion]);
        },
        "darkzone_location": function() {
            return Promise.resolve("South Boston");
        }
    }
  


    function addBotMessage(text, second_delay) {

        if (!text) { 
            console.log("[view] skip empty bot message");
            return; 
        }
        console.log("[view] add bot message: " + text);

        function replaceMessageVariable(match) {
            var tpl_var = match[0];
            var str = match[1]

            return new Promise(function(resolve, reject) {
                if (transforms.hasOwnProperty(str)) {
                    transforms[str]().then(function(tpl_val) {
                        text = text.replace(tpl_var, tpl_val);
                        resolve(text);
                    })
                }
                else {
                    resolve(text)
                }
            });
        }

        // run text through variable converter before returning
        
        let reg = /#{([A-Za-z_]*)}/g;

        let match;

        var fns = [];
        while (match = reg.exec(text)) {
            var fn = replaceMessageVariable(match);
            fns.push(fn);
        }

        Promise.all(fns)
            .then(function() {
                setTimeout(function() {      
                    $data.messages.push({
                        "me": false,
                        "text": text
                    });
                    setTimeout(scrollChat, 10);
                }, second_delay);
            });
    }

    function actOnReply(reply) {
        
        if (!reply) {
            return;
        }

        if (reply.intents.length) {
            var main_intent = reply.intents[0].intent;
        }


        if (main_intent == "event-only") {
            reply.entities.forEach(function(entity) {
                if (entity.entity == "event") {
                    self.ctx.event_type = entity["value"];
                }
            })
        }

        if (main_intent == "new-supply-item") {
            reply.entities.forEach(function(entity) {
                if (entity.entity == "supply-item") {
                    self.ctx.supply = entity["value"];
                }
            })
        }

        console.log("chat context", self.ctx, reply);
        
        for (var idx in reply.output) {
            reply.output[idx].forEach(function(out) {
                if (out.response_type == "text") {
                    addBotMessage(out.text);
                }
            })
        }

        if (main_intent == "map-display" || main_intent == "place-only" || main_intent == "event-only" || main_intent == "map-zoom-in-place") {
            var location = "";
            reply.entities.forEach(function(entity) {
                if (entity.entity == "sys-location") {
                    if (location) {
                        location += " ";
                    }
                    location += entity.value;
                }
            });
            if (location.length) {

                if (self.ctx.state && main_intent == "map-zoom-in-place") {
                    // focus with state context
                    location = location + " " + self.ctx.state;
                }

                actOnLocation(location).then(function(data) {
                    if (main_intent == "place-only") {
                        console.log("event region " + location, data);
                        if (data.state) {
                            self.ctx.state = data.state;
                        }
                    }
                    if (main_intent == "map-zoom-in-place") {
                        actOnZoomInPlace();
                    }
                })
            }
        }
        else if (main_intent == "map-display-near-me") {
            getMyLocation()
                .then(actOnMyLocation);
        }
        else if (main_intent == "map-zoom-in") {
            actOnZoomIn();
        }
        else if (main_intent == "map-zoom-out") {
            actOnZoomOut();
        }
        else if (main_intent == "route-prepare") {
            LX.Model.findRoutes(self.ctx.geohash.substr(0,3)).then(function(results) {
                var routes = {};
                results.rows.forEach(function(row) {
                    if (row.value.st && row.value.st < 2) {
                        routes[row.id] = row.value;
                    }

                });

                for (var idx in routes) {
                    console.log("show one route", routes[idx]);
                    console.log(routes[idx]);
                    self.map.showOneRoute(routes[idx]);
                }

                addBotMessage("I found " + Object.keys(routes).length + " existing routes in this region.", 1000);
            });
        }    

    }

    function actOnZoomInPlace() {

        setTimeout(function() {
            self.map.setZoom(self.map.getZoom()+3);
            addBotMessage("The most needed item here is clothing.");
        }, 1000);
    }

    function actOnZoomIn() {

        self.map.setZoom(self.map.getZoom()+3 ); 
    }

    function actOnZoomOut() {

        self.map.setZoom(self.map.getZoom()-2); 
    }

    function actOnMyLocation(pos) {
        
        self.map.setView([pos.coords.latitude, pos.coords.longitude], 10);

        return LX.Model.getNamesFromLocation(pos)
            .then(function(data) {
                if (data.results.length) {
                    var pick = data.results[0];
                    addBotMessage("Now showing " + pick.display_name + " on the map.");
                }
                else {
                    addBotMessage("Now showing a location near you on the map.");
                }
                return pick;
            });
    }

    function actOnLocation(name) {
        console.log("[view] find on map: " + name);
        return LX.Model.getLocationsFromName(name).then(function(data) {
            var pick = data.results[0];
            var zoom_level = 4 + (pick.place_rank)/2;
            var coords = [pick.lat, pick.lon];
            self.map.setView(coords, zoom_level);
            //addBotMessage( "Now showing " + pick.display_name + " on the map.", 0);
            return pick;
        });
    }





    //----------------------------------------------------------------- Map Layers
    LX.Model.getFilterTypes().reverse().forEach(function(type) {
        if (type.active === true) {
            self.map.show[type.id]();
        }
    })



	//----------------------------------------------------------------- Vue Interface

	self.Vue = new Vue({
        data: {
            filters: LX.Model.getFilterTypes(),
            message: "",
            messages: [],
            is_sending: false
        },
        methods: {
        	toggleFilter: function(filter) {
        		Vue.set(filter, "active", !filter.active);

                if (filter.active) {
                    self.map.show[filter.id]();
                }
                else {
                    self.map.hide[filter.id]();
                }  
        	},
            chatMessageSubmit: function() {

                if (!$data.message) {
                    return console.log("[view] skip empty message");
                }

                $data.messages.push({
                    "me": true,
                    "text": $data.message
                });


                LX.Model.sendMessage($data.message).then(actOnReply);

                self.Vue.is_sending = true;

                // always scroll to bottom after sending message
                setTimeout(scrollChat, 10);
                setTimeout(function() {
                    self.Vue.is_sending = false;
                }, 250+(Math.random()*100));
                $data.message = "";
            },
            handleNavButton: function(action) {
                var map = {
                    "status": "bolt",
                    "broadcast": "bullhorn",
                    "route": "route"
                }

                if (action) {

                    $data.messages.push({
                        "me": true,
                        "icon": map[action]
                    });


                    LX.Model.sendMessage(action).then(actOnReply);
                }
            }
        },
        mounted: function() {
        	self.map.render();
            actOnLocation("Boston");
            addBotMessage("#{timed_greeting}! I'm here to help with recovery and communication. You can tell me about your goals for today or ask me questions about the places around you.")
        }
    });

    var $data = self.Vue.$data;
    
    self.Vue.$mount("#app");

	return self;
})();

