const path = require("path");
const PouchDB = require("pouchdb");
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: path.resolve("..", "network.log"),
    dateFormat: "YYYY.MM.DD"
})
log.setLevel("debug");

const peer_uri = "https://lantern.global/db/lnt";
const host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const cloudant_uri = "https://" + host + "/lantern-us-demo"
const peer = new PouchDB(peer_uri);


function getDatabase() {
    var final_uri = cloudant_uri.replace("://", "://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@");
    var db = new PouchDB(final_uri); 
    return db;
}

function syncDatabases(onStart,onComplete) {
    onStart("[lantern] " + peer_uri + " --> " + cloudant_uri);
    var db = getDatabase();
    return peer.replicate.to(db)
        .then(function(results) {
            return onComplete(results);
        });
}


function insertDesignDoc(rev) {
    var mapFn = function(doc) {
        if (doc._id.substr(0,2) == "v:") {
            if (doc.hasOwnProperty("gp")) {
                emit([doc.ct[0], doc.gp[0].substr(0,7), doc._id],doc);
            }
        }
    }.toString();



    var itemMapFn = function(doc) {

        if (doc._id.substr(0,2) == "i:") {
            if (doc.hasOwnProperty("pt")) {

                doc.ct.forEach(function(category) {
                    emit([doc.pt[0], category], doc);
                });
            }
        }
    }.toString();

    var design_doc = {
        _id: "_design/venue",
        views: {
            "by_geo": {
                map: mapFn
            },
            "by_item": {
                map: itemMapFn,
                reduce: "_count"
            }
        }
    }

    if (rev) {
        design_doc._rev = rev;
    }

    console.log(design_doc)

    return db.post(design_doc).then(function(response) {
        log.debug("[network] design document updated", response);
    }).catch(function(err) {
        log.error(err);
    })
}


//--------------------------------------------------------------- Initialization
if (require.main === module) {

    var db = getDatabase();

    var startFn = (response) => { 
        log.info(response) 
    };

    var completeFn =  (results) => {
        log.info("[lantern] stand-alone replication complete");
        log.debug(results);
    }

    // save design document
    db.get("_design/venue", {rev_info: true}).then(function(response) {
        insertDesignDoc(response._rev);
    })
    .catch(function() {
        insertDesignDoc();
    })

    syncDatabases(startFn, completeFn)
        .catch(function(err) {
            log.error("[lantern] error", err);
        });
} else {

    // replicate our selected peer database to cloudant for further use
    module.exports = {
        timer: 120, // every 2 minutes
        start: syncDatabases
    }
}