// https://firms.modaps.eosdis.nasa.gov/active_fire/
// https://github.com/Call-for-Code/fires-api-nodejs/blob/master/app.js

const fs = require('fs');
const request = require('request-promise-native');
const Cloudant = require('@cloudant/cloudant');
const parse = require('csv-parse');
const Geohash = require("latlon-geohash");
var log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'fire.log',
    dateFormat:'YYYY.MM.DD'
})
log.setLevel('debug');



//--------------------------------------------------------------- Configuration
// cloudant access uri
const CLOUDANT_HOST = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const CLOUDANT_DB_NAME = "nexusdb";

// NASA fire data CSV
const VIIRS_URL = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs/csv/VNP14IMGTDL_NRT_Global_24h.csv'



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

const callActiveFireData = function(done) {
    
    // loading this each time takes into account any credential changes since last run
    db = getDatabase();

    db.info().then(function(response) {
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
    


//--------------------------------------------------------------- Initialization
if (require.main === module) {
    callActiveFireData().then(function() {
        log.info("[fire] completed stand-alone run");
    });
} else {
    module.exports = {
      timer: 60 * 60 * 24, // every 24 hours
      start: function(onStart,onComplete) {
        onStart("[fire] begin gathering fire data from NASA");
        callActiveFireData(onComplete);
      }
    }
}

