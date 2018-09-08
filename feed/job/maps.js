const path = require("path");
const PouchDB = require("pouchdb");
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: path.resolve("..", "network.log"),
    dateFormat: "YYYY.MM.DD"
})
log.setLevel("debug");

const peer_uri = "https://lantern.global/db/map";
const host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const cloudant_uri = "https://" + host + "/lantern-us-maps"
const peer = new PouchDB(peer_uri);

function syncDatabases(onStart,onComplete) {
    onStart("[lantern] " + peer_uri + " --> " + cloudant_uri);
    var final_uri = cloudant_uri.replace("://", "://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@");
    var cloudant = new PouchDB(final_uri); 
    return peer.replicate.to(cloudant)
        .then(function(results) {
            return onComplete(results);
        });
}

//--------------------------------------------------------------- Initialization
if (require.main === module) {

    var startFn = (response) => { 
        log.info(response) 
    };

    var completeFn =  (results) => {
        log.info("[lantern] stand-alone replication complete");
        log.debug(results);
    }

    syncDatabases(startFn, completeFn)
        .catch(function(err) {
            log.error("[lantern] error", err);
        });

} else {

    // replicate our selected peer database to cloudant for further use
    module.exports = {
        timer: 60 * 60, // every 1 hour
        start: syncDatabases
    }
}