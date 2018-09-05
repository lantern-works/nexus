var PouchDB = require("PouchDB");

// check for cloudant database credentials before import
if (!process.env.CLOUDANT_API_KEY || !process.env.CLOUDANT_API_PASS) {
	console.error("Please make sure your Cloudant API Key and Password are defined in your shell environment.");
	process.exit();
}

// setup PouchDB database objects, also compatible with Cloudant databases

// n.b. at this time direct sync by posting to _replicate endpoint or _replicator database
// does not work due to an apparent bug related to PouchDB Server
// as a not-so-elegant workaround, this import script could be run on a cron in the future 
// to regularly gather latest data

var peer_uri = "https://lantern.global/db/lnt";
var host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
var cloudant_uri = "https://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@" + host + "/mytest"
var peer = new PouchDB(peer_uri);
var cloudant = new PouchDB(cloudant_uri);

// replicate our selected peer database to cloudant for further use
console.log("beginning replication from %s", peer_uri);
peer.replicate.to(cloudant).then(function(response) {
	console.log("Replication from Peer to Cloudant Complete", response);
});