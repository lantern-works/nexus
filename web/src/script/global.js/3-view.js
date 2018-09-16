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
	var self = {
        show: {},
        hide: {}
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

	self.Map = L.map('map').setView([38.42,-102.79], 4);


    // we're going to keep layer data for the map here
    self.Layers = {};

    LX.Model.getWeatherTypes().forEach(function(type) {
        self.Layers[type.id] = {};
    })



	self.showMap = function() {
		console.log("[view] render and center on united states");
		var gl = L.mapboxGL({
		    attribution: false,
		    maxZoom: 16,
		    crossOrigin: true,
		    accessToken: 'not-needed',
		    style: 'https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/streets/style.json?key=ZokpyarACItmA6NqGNhr'
		}).addTo(self.Map);
	}


	//----------------------------------------------------------------- Fire Layers

    function showFire(row, layer_group) {

        //console.log("[view] draw region at %s with scale of %s", row.key, row.value);
        var latlon = Geohash.decode(row.key);

        var opts = {
            color: "red",
            radius: 200*row.value
        }

        var circle = L.circle(latlon, opts)
        layer_group.addLayer(circle).addTo(self.Map);
        circle.bringToBack();
    }



	self.show.fire = function() {
		console.log("[view] show fire");


        // @todo united states and nearby only for now
        LX.Model.getUnitedStatesGeohash().forEach(function(gh) {

            if (!self.Layers.fire[gh]) {
                self.Layers.fire[gh] = L.layerGroup();
            }

            if (!self.Layers.fire[gh].getLayers().length) {
                console.log("[view] looking for fire:" +  gh)
                LX.Model.findWeather("fire", gh)
                    .then(function(response) {
                        response.rows.forEach(function(row) {
                            showFire(row, self.Layers.fire[gh]);
                        });
                    });
            }
            
            self.Map.addLayer(self.Layers.fire[gh]);
            
        });
	}

	self.hide.fire = function() {
		console.log("[view] hide fire");
        for (var idx in self.Layers.fire) {
            self.Map.removeLayer(self.Layers.fire[idx]);
        }
	}

    //----------------------------------------------------------------- Chat Interface
    function scrollChat() {
        var chat = document.getElementById('message-container'); 
        chat.scrollTop = chat.scrollHeight;
    }

    //----------------------------------------------------------------- Place Layers

    function showPlace(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        opts.icon = L.icon.fontAwesome({ 
            markerColor: "#3273dc",
            iconColor: '#FFF'
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self.Map);
    }


    self.show.place = function() {
        console.log("[view] show place");

        if (!self.Layers.place.all) {
            self.Layers.place.all = L.layerGroup();
        }

        if (!self.Layers.place.all.getLayers().length) {
            LX.Model.findPlaces()
                .then(function(response) {
                    response.rows.forEach(function(row) {
                        showPlace(row, self.Layers.place.all);
                    });
                });
        }

        self.Map.addLayer(self.Layers.place.all);
    }


    self.hide.place = function() {
        console.log("[view] hide place");
        self.Map.removeLayer(self.Layers.place.all);
    }




    //----------------------------------------------------------------- Vehicle Layers

    function showVehicle(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        opts.icon = L.icon.fontAwesome({ 
            markerColor: "#9273dc",
            iconColor: '#FFF'
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self.Map);
    }


    self.show.vehicle = function() {
        console.log("[view] show vehicle");

        if (!self.Layers.vehicle.all) {
            self.Layers.vehicle.all = L.layerGroup();
        }

        if (!self.Layers.vehicle.all.getLayers().length) {
            LX.Model.findVehicles()
                .then(function(response) {
                    response.rows.forEach(function(row) {
                        showVehicle(row, self.Layers.vehicle.all);
                    });
                });
        }

        self.Map.addLayer(self.Layers.vehicle.all);
    }


    self.hide.vehicle = function() {
        console.log("[view] hide vehicle");
        self.Map.removeLayer(self.Layers.vehicle.all);
    }

    //----------------------------------------------------------------- Conversation

    function addBotMessage(text, second_delay) {
        setTimeout(function() {      
            $data.messages.push({
                "me": false,
                "text": text
            });
            setTimeout(scrollChat, 10);
        }, second_delay*1000);
    }

    function actOnReply(reply) {
        

        if (reply.intents.length) {
            var main_intent = reply.intents[0].intent;
            console.log(main_intent);
            console.log(reply);
        }

        
        addBotMessage(reply.output.text.join(" "));
        
        if (main_intent == "map-display") {
            var location = "";
            reply.entities.forEach(function(entity) {
                if (entity.location) {
                    console.log("appending location", entity.value);
                    if (location) {
                        location += " ";
                    }
                    location += entity.value;
                }
            });
            if (location.length) {
                actOnLocation(location);
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
            

    }

    function actOnZoomIn() {

        self.Map.setZoom(self.Map.getZoom()+1); 
    }

    function actOnZoomOut() {

        self.Map.setZoom(self.Map.getZoom()-1); 
    }

    function actOnMyLocation(pos) {
        
        self.Map.setView([pos.coords.latitude, pos.coords.longitude], 13);

        LX.Model.getNamesFromLocation(pos)
            .then(function(data) {
                console.log("found name", pos, data);

                if (data.results.length) {
                    var name = data.results[0].display_name;
                    addBotMessage("Now showing " + name + " on the map.");
                }
                else {
                    addBotMessage("Now showing a location near you on the map.");
                }
                
            });
    }

    function actOnLocation(name) {
        console.log("[view] find on map: " + name);
        LX.Model.getLocationsFromName(name).then(function(data) {
            console.log(data);

            var pick = data.results[0];
            
            console.log(pick);            
            var bounds = pick.boundingbox.reduce(function(result, value, index, array) {
                if (index % 2 === 0) {
                    result.push(array.slice(index, index + 2).reverse());
                }
                return result;
            }, []);
            var zoom_level = 2 + (pick.place_rank)/2;
            var coords = [pick.lat, pick.lon];

            self.Map.setView(coords, zoom_level);

            addBotMessage( "Now showing " + pick.display_name + " on the map.", 2);

        });
    }


	//----------------------------------------------------------------- Vue Interface

	self.Vue = new Vue({
        data: {
            filters: LX.Model.getWeatherTypes(),
            message: "",
            messages: LX.Model.getFakeMessages()
        },
        methods: {
        	toggleFilter: function(filter) {
        		Vue.set(filter, "active", !filter.active);

                if (filter.active) {
                    self.show[filter.id]();
                }
                else {
                    self.hide[filter.id]();
                }  
        	},
            chatMessageSubmit: function() {
                console.log($data.message);
                $data.messages.push({
                    "me": true,
                    "text": $data.message
                });


                LX.Model.sendMessage($data.message).then(actOnReply);

                // always scroll to bottom after sending message
                setTimeout(scrollChat, 10);
                $data.message = "";
            }
        },
        mounted: function() {
        	self.showMap();
            scrollChat();
        }
    });

    var $data = self.Vue.$data;
    
    self.Vue.$mount("#app");

	return self;
})();
