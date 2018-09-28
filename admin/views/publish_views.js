
const PouchDB = require("pouchdb");
const log = require("simple-node-logger").createSimpleLogger({
    logFilePath: "query.log",
    dateFormat: "YYYY.MM.DD"
});
log.setLevel("debug");

const host = "37bd9e99-2780-4965-8da8-b6b1ebb682bc-bluemix.cloudant.com"
const cloudant_uri = "https://" + host + "/lantern-boston-flood-scenario"
var final_uri = cloudant_uri.replace("://", "://" + process.env.CLOUDANT_API_KEY + ":" + process.env.CLOUDANT_API_PASS + "@");
var db = new PouchDB("https://lantern.global/lnt/"); 



function saveDesignDocument(design_doc)  {
    return db.post(design_doc).then(function(response) {
        log.info("[network] design document updated", response);
    }).catch(function(err) {
        log.error(err);
    });
}


//--------------------------------------------------------------- Define Views
var views = {
    "request": {},
    "event": {},
    "route": {},
    "item": {},
    "device": {}
}



views.item.by_geo = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "i:") {
            if (doc.hasOwnProperty("pt")) {
                emit(doc.pt[0],doc);
            }
        }
    }
}

views.route.by_geo = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "r:") {
            if (doc.hasOwnProperty("gp")) {
                doc.gp.forEach(function(geo) {
                    if (geo.length > 0) {
                        emit(geo,doc);                    
                    }
                });
            }
        }
    }
}


views.device.by_geo = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "d:") {
            if (doc.hasOwnProperty("gp")) {
                doc.gp.forEach(function(geo) {
                    if (geo.length > 0) {
                        emit(geo,doc);                    
                    }
                });
            }
        }
    }
}



views.request.by_geo = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "q:") {
            if (doc.hasOwnProperty("st")) {
                emit(doc.st,doc);
            }
        }
    }
}

views.event.by_status = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "e:") {
            if (doc.hasOwnProperty("st")) {
                emit(doc.st,doc);
            }
        }
    }.toString()
};

views.event.by_geo = {
    map: function(doc) {
        if (doc._id.substr(0,2) == "e:") {
            if (doc.hasOwnProperty("gp")) {
                emit( doc._id,doc);
            }
        }
    }.toString()
}

var fns = [];

for (var doc_id in views) {
    console.log(doc_id)

    var design_doc = {
        _id: "_design/" + doc_id,
        views: {}
    }

    for (var view_id in views[doc_id]) {
        design_doc.views[view_id] = views[doc_id][view_id];
        design_doc.views[view_id].map = design_doc.views[view_id].map.toString()
    }

    console.log(design_doc);
    var fn = db.get("_design/"+doc_id, {rev_info: true})
        .then(function(response) {
            console.log("RESPONSE", response)
            if (response._rev) {
                design_doc._rev = response._rev;
                return saveDesignDocument(design_doc);
            }
            else {
                console.log(response);
            }
        })
        .catch(function(err) {
            if (err.error == "not_found") {
                return saveDesignDocument(design_doc);
            }
            else {
                log.error(err);
            }
        });
    fns.push(fn);
}


Promise.all(fns).then(function() {
    console.log("Completed View Publishing");
    setTimeout(process.exit, 100);
});