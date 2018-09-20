var LX = window.LX || {};
window.LX = LX;

LX.Map = (function() {

	var self = {
		_map: L.map('map').setView([38.42,-102.79], 4),
        layers: {},
        show: {},
        hide: {}
	};


    LX.Model.getFilterTypes().forEach(function(type) {
        self.layers[type.id] = {};
    });


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
    self.getZoom = self._map.getZoom;

    self.render = function(svg) {


        var uri = "https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/streets/";

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

        console.log(tiles);
        tiles.addTo(self._map);
    }


    //----------------------------------------------------------------- Place Layers

    function showPlace(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        var icon = "bed";
        opts.icon = L.icon.fontAwesome({ 
            iconClasses: 'fa fa-'+icon,
            markerColor: "#FFAD00",
            iconColor: '#FFF'
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);
    }


    self.show.place = function() {
        console.log("[map] show place");

        if (!self.layers.place.all) {
            self.layers.place.all = L.layerGroup();
        }

        if (!self.layers.place.all.getLayers().length) {
            LX.Model.findPlaces()
                .then(function(response) {
                    console.log("PLACES", response)
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



    self.show.request = function() {
        console.log("[map] show requests");
    }

    self.hide.request = function() {
        console.log("[map] hide requests");
    }


    //----------------------------------------------------------------- Vehicle Layers

    function showVehicle(row, layer_group) {
        var latlon = Geohash.decode(row.key[1]);
        var opts = {};
        var icon = "truck";
        opts.icon = L.icon.fontAwesome({ 
            iconClasses: 'fa fa-'+icon,
            markerColor: "#6FB1FA",
            iconColor: '#FFF',
        });

        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);
    }


    self.show.vehicle = function() {
        console.log("[map] show vehicle");

        if (!self.layers.vehicle.all) {
            self.layers.vehicle.all = L.layerGroup();
        }

        if (!self.layers.vehicle.all.getLayers().length) {
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
        console.log(self)



        // @todo united states and nearby only for now
        LX.Model.getUnitedStatesGeohash().forEach(function(gh) {

            console.log(self.layers.fire);

            if (!self.layers.fire[gh]) {
                self.layers.fire[gh] = L.layerGroup();
            }

            if (!self.layers.fire[gh].getLayers().length) {
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

	return self;

});