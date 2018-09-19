
const PouchDB = require("pouchdb");
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: "query.log",
    dateFormat: "YYYY.MM.DD"
});

const host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const cloudant_uri = "https://" + host + "/lantern-boston-flood-scenario"
var final_uri = cloudant_uri.replace("://", "://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@");
var db = new PouchDB(final_uri); 


//--------------------------------------------------------------- Define Views

function insertItemDesignDoc(rev) {


    var mapFn = function(doc) {
        if (doc._id.substr(0,2) == "i:") {
            if (doc.hasOwnProperty("pt")) {
                emit(doc.pt[0],doc);
            }
        }
    }.toString();


    var design_doc = {
        _id: "_design/item",
        views: {
            "by_geo": {
                map: mapFn
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






function insertRouteDesignDoc(rev) {


    var mapFn = function(doc) {
        if (doc._id.substr(0,2) == "r:") {
            if (doc.hasOwnProperty("gp")) {
                emit( doc._id,doc);
            }
        }
    }.toString();


    var design_doc = {
        _id: "_design/route",
        views: {
            "by_geo": {
                map: mapFn
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




//--------------------------------------------------------------- Save Views
// save design document
db.get("_design/item", {rev_info: true}).then(function(response) {
    insertItemDesignDoc(response._rev);
})
.catch(function() {
    insertItemDesignDoc();
})




// save design document
db.get("_design/route", {rev_info: true}).then(function(response) {
    insertRouteDesignDoc(response._rev);
})
.catch(function() {
    insertRouteDesignDoc();
})


// save design document
db.get("_design/venue", {rev_info: true}).then(function(response) {
    insertDesignDoc(response._rev);
})
.catch(function() {
    insertDesignDoc();
})