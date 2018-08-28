__base = "/";

// view
var map = L.map('map').setView([38.42,-102.79], 4);
var gl = L.mapboxGL({
    attribution: false,
    maxZoom: 16,
    crossOrigin: true,
    accessToken: 'not-needed',
    style: 'https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/streets/style.json?key=ZokpyarACItmA6NqGNhr'
}).addTo(map);


function drawMarker(geohash) {
	var latlon = Geohash.decode(geohash);
	console.log()
	var opts = {};
    opts.icon = L.icon.fontAwesome({ 
        markerColor: "#3273dc",
        iconColor: '#FFF'
    });
	var marker = L.marker(latlon, opts).addTo(map);
}

function drawRegion(geohash, count) {
	console.log("Draw region at %s with %s venues", geohash, count);
	var latlon = Geohash.decode(geohash);

	var opts = {
		color: "red",
		radius: 100000
	}

	var circle = L.circle(latlon, opts).addTo(map);

	circle.bringToBack();

}

// model
var regions = {};
var precision = 3;
var db = new PouchDB("https://lantern.global/db/lnt");
console.log(db);
db.find({
	selector: {
		_id: {$gt: "v:"},
		gp: {$type:"array"}
	}
}).then(function(result) {

	// draw markers and define regions for analysis
	result.docs.forEach(function(venue) {
		//console.log(venue);
		venue.gp.forEach(function(geohash) {
			drawMarker(geohash);
			var short_geohash = geohash.substr(0,precision);
			regions[short_geohash] = regions[short_geohash] || 0;
			regions[short_geohash]++;
		});
	});	

	// draw circle around each region
	for (var idx in regions) {
		drawRegion(idx, regions[idx]);
	}
});

// @todo use weather data to identify active issues

