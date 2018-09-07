var PouchDB = require("pouchdb");
var log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'network.log',
    dateFormat:'YYYY.MM.DD'
})
log.setLevel('debug');

var peer_uri = "https://lantern.global/db/lnt";
var host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
var cloudant_uri = "https://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@" + host + "/nexusdb"
var peer = new PouchDB(peer_uri);
var cloudant = new PouchDB(cloudant_uri);

// replicate our selected peer database to cloudant for further use
module.exports = {
    timer: 120, // every 2 minutes
    start: function(onStart,onComplete) {
        onStart("[lantern] begin replication from peer: " + peer_uri);
        return peer.replicate.to(cloudant).then(onComplete);
    }
}