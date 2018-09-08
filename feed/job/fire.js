// https://firms.modaps.eosdis.nasa.gov/active_fire/
// https://github.com/Call-for-Code/fires-api-nodejs/blob/master/app.js

const fs = require("fs");
const path = require("path");
const request = require("request-promise-native");
const Cloudant = require("@cloudant/cloudant");
const parse = require("csv-parse");
const Geohash = require("latlon-geohash");
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: path.resolve("..", "fire.log"),
    dateFormat: "YYYY.MM.DD"
})
log.setLevel("debug");



//--------------------------------------------------------------- Configuration
// cloudant access uri
const CLOUDANT_HOST = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const CLOUDANT_DB_NAME = "lantern-nexus";

// NASA fire data CSV
const VIIRS_URL = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs/csv/VNP14IMGTDL_NRT_Global_24h.csv';



//--------------------------------------------------------------- Helpers

Promise.each = function(arr, fn) { // take an array and a function
    // invalid input
    if(!Array.isArray(arr)) return Promise.reject(new Error("Non array passed to each"));
    // empty case
    if(arr.length === 0) return Promise.resolve(); 
    return arr.reduce(function(prev, cur) { 
        return prev.then(() => fn(cur))
    }, Promise.resolve());
}

const getDatabase = function() {
    // reconstruct uri in case our environment has changed since last run
    var cloudant_uri = "https://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@" + CLOUDANT_HOST;
    var server = new Cloudant({
        url: cloudant_uri,
        plugins: 'promises'
    });
    return server.use(CLOUDANT_DB_NAME);
}

const getFireData = function() {
    log.info("[fire] requesting fire data from: " + VIIRS_URL);
    return new Promise(function(resolve, reject) {
        request(VIIRS_URL)
            .then(fireCSV => {

                let csv_parser_options = {
                    cast: true, 
                    columns: true, 
                    relax_column_count: true, 
                    trim: true
                }

                parse(fireCSV, csv_parser_options, (err, firedata) => {
                    if (err) {
                        log.error(err)
                        reject(err);
                    }
                    resolve(firedata);
                });
            });
    });
}

// @todo can batch and bulk post documents to cloudant
const upsertFireDataRow = function(db,fire) {
    return new Promise(function(resolve, reject) {

        let gh = Geohash.encode(fire.latitude, fire.longitude);

        let datetime = new Date(new Date(fire.acq_date).setSeconds(fire.acq_time));

        let id = "w:f:"+datetime.getTime()+'_'+gh;

        /*let props = {
            "bright_ti4": fire['bright_ti4'], 
            "bright_ti5": fire['bright_ti5'], 
            "scan": fire['scan'], 
            "track": fire['track'], 
            "satellite": fire['satellite'], 
            "confidence": fire['confidence'], 
            "version": fire['version'], 
            "frp": fire['frp'], 
            "daynight": fire['daynight'], 
        }*/

        let doc = {
          "gp": [gh], 
          "lv": fire.frp,
          "$ca": datetime
        };

        
        log.debug("[fire] " + id);
        setTimeout(function() {
            db.insert(doc, id).then(function(result) {
                log.debug("[fire]", result);
                resolve(result);
            })
            .catch(function(err) {
                if (err.statusCode == 409) {
                    log.debug("[fire] skip since conflict");
                    resolve();
                }
                else {
                    log.debug("[fire] skip since unexpected error");
                    log.error(err);
                    resolve();
                }
            });
        }, 500+Math.random()*500);
    });
}

const handleFail = function(err) { // API call failed...
    log.error(err.hasOwnProperty('message') ? err.message : err)
}

const callActiveFireData = function(db) {
    
    return db.info().then(function(response) {
        log.info("[fire] good database access", response);
        var fn = function(item) {
            return upsertFireDataRow(db,item)
        }

        return getFireData().then(function(firedata) {
            log.info("[fire] found items: " + firedata.length)
            return Promise.each(firedata, fn);
        });
    })
    .catch(function(err) {
        log.error("[fire] unable to work with database", err);
    });
}
    

function insertDesignDoc(rev) {

    var design_doc = {
        _id: "_design/fire",
        views: {
            "by_geo": {
                map: function(doc) {
                    if (doc._id.substr(0,4) == "w:f:") {
                        if (doc.hasOwnProperty("gp") && doc.hasOwnProperty("lv")) {
                            
                            // only show results a day+ old
                            var d = new Date();
                            d.setDate(d.getDate() - 1.5);
                            var updated_at = new Date(doc.$ca).getTime();
                            if (updated_at - d.getTime() > 0 ) {
                                emit(doc.gp[0].substr(0,7), doc.lv);
                            }  
                        }
                    }
                },
                reduce: "_sum"
            }
        }
    }

    if (rev) {
        design_doc._rev = rev;
    }

    return db.insert(design_doc).then(function(response) {
        log.debug("[fire] design document updated", response);

    });
}


//--------------------------------------------------------------- Initialization
if (require.main === module) {

    var db = getDatabase();

    // save design document
    db.get("_design/fire", {rev_info: true}).then(function(response) {
        insertDesignDoc(response._rev);
    })
    .catch(function() {
        insertDesignDoc();
    })


    callActiveFireData(db)
        .then(function() {
            log.info("[fire] completed stand-alone run");
        })
        .catch(function(err) {
            log.error("[fire] error", err);
        });

} else {
    module.exports = {
      timer: 60 * 60 * 24, // every 24 hours
      start: function(onStart,onComplete) {
        // loading this each time takes into account any credential changes since last run
        var db = getDatabase();
        onStart("[fire] begin gathering fire data from NASA");
        callActiveFireData(db).then(function(results) {
            onComplete();
        });
      }
    }
}

