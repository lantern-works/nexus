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
        "d": "Lantern device broadcasting data",
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
