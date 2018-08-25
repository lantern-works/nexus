// view
var map = L.map('map').setView([38.42,-102.79], 4);
var gl = L.mapboxGL({
    attribution: false,
    maxZoom: 16,
    crossOrigin: true,
    accessToken: 'not-needed',
    style: 'https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/streets/style.json?key=ZokpyarACItmA6NqGNhr'
}).addTo(map);


// model
var db = new PouchDB("https://lantern.global/db/lnt");
console.log(db);
db.find({
	selector: {
		_id: {$gt: "v:"},
		gp: {$type:"array"}
	}
}).then(function(result) {
	result.docs.forEach(function(venue) {
		console.log(venue);
		venue.gp.forEach(function(geohash) {
			var latlon = Geohash.decode(geohash);
			console.log(latlon);
		})
	})
});