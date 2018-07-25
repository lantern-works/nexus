var db = require("../lib/pouchdb")("https://lantern.global/db/lantern");

db.info().then(function(res) {
    console.log(res);
});