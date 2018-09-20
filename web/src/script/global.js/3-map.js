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
        console.log(key, subkey, self.layers[key], subkey)
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
    function showRequest(row, layer_group) {
        var latlon = Geohash.decode(row.value.gp[0]);
        var opts = {};
        var icon = category_icon_map[row.value.ct[0]];
        var color = category_icon_color[row.value.ct[0]];

        opts.icon = L.icon.fontAwesomeCircle({ 
            iconClasses: 'fa fa-'+icon,
            iconColor: "#"+color,
            markerColor: '#FFF',
            markerStroke:"#"+color
        });
        var marker = L.marker(latlon, opts);
        layer_group.addLayer(marker).addTo(self._map);
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

        self._map.addLayer(self.layers.request.all);

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

	return self;

});