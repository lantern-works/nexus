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
        ctx: {
            state: null // track conversation / map focus
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

	self.map = LX.Map();





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
                document.write("Hello");
            }
        },
        "active_events": function() {
            return LX.Model.findActiveEvents().then(function(results) {
                var count = results.rows.length;
                var cities = [];

                var fns = [];

                results.rows.forEach(function(row) {
                    var fn = LX.Model.getNamesFromGeohash(row.value.gp[0]).then(function(names) {
                        if (names.results[0].city) {
                            cities.push(names.results[0].city);                            
                        }
                    });
                    fns.push(fn);
                });

                return Promise.all(fns).then(function() {
                    addBotMessage("You can say: " + cities.join(", "), 300);
                    return [count, "active", (count == 1 ? "event" : "events")].join(" ");
                });

            });
        },
        "pending_request_count": function() {
            return LX.Model.findPendingRequests($data.target_geohash).then(function(results) {
                // @todo use above data
                var count = results.rows.length;
                return [count, "unattended", (count == 1 ? "request" : "requests"), "for supplies"].join(" ");
            })
        },
        "categorized_data": function() {
            return Promise.resolve("the most needed supply item is Water and least needed is Medical");
        },
        "suggested_location": function() {
            return Promise.resolve("Roxbury");
        },
        "suggested_supply_type": function() {
            return Promise.resolve("medical");
        },
        "darkzone_location": function() {
            return Promise.resolve("Dorchester");
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
                    transforms[str](tpl_var).then(function(tpl_val) {
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
        

        if (reply.intents.length) {
            var main_intent = reply.intents[0].intent;
        }

        
        addBotMessage(reply.output.text.join(" "));
        console.log(reply);
        if (main_intent == "map-display" || main_intent == "place-only" || main_intent == "map-zoom-in-place") {
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
            

    }

    function actOnZoomInPlace() {

        setTimeout(function() {
            self.map.setZoom(self.map.getZoom()+2);
            addBotMessage("The most needed item here is clothing.");
        }, 1000);
    }

    function actOnZoomIn() {

        self.map.setZoom(self.map.getZoom()+2); 
    }

    function actOnZoomOut() {

        self.map.setZoom(self.map.getZoom()-2); 
    }

    function actOnMyLocation(pos) {
        
        self.map.setView([pos.coords.latitude, pos.coords.longitude], 13);

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
    LX.Model.getFilterTypes().forEach(function(type) {
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
            target_geohash: "drt2z"
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
        	self.map.render();
            LX.Model.sendMessage("status").then(actOnReply);
        }
    });

    var $data = self.Vue.$data;
    
    self.Vue.$mount("#app");

	return self;
})();
