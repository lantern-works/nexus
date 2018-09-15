const http = require("http");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const express = require("express");
const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const assistant_workspace = "6cc0f2bc-c8d4-4103-ae63-327be5237c03";

const log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'http.log',
    dateFormat:'YYYY.MM.DD'
})

const serv = express();
const static_path = path.resolve(__dirname, "public");

serv.use(require("./middleware/cors"));
serv.use("/", express.static(static_path));
serv.disable("x-powered-by");

const http_port = process.env.VCAP_APP_PORT || process.env.PORT || 8080;
const httpServer = http.createServer(serv);



var assistant = new AssistantV1({
    version: "2018-07-10",
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    url: "https://gateway.watsonplatform.net/assistant/api"
 });


serv.post("/api/message", bodyParser.json(), function(req,res) {
    if (req.body.text) {
        assistant.message({
        	workspace_id: assistant_workspace,
        	input: {'text': req.body.text}
        },  function(err, response) {
        	if (err) {
        	   return res.status(500).json({"ok": false, "message": err});
        	}
        	else {
        	   res.status(201).json(response);
        	}
        });
    }
    else {
        return res.status(403).json({"ok": false, "message": "Required parameter not found: text"});
    }
});

serv.post("/api/reverse_geocode", bodyParser.json(), function(req,res) {
    if (req.body.latitude && req.body.longitude) {

        console.log("starting reverse geocode");
        var uri = "https://geocoder.tilehosting.com/r/"+req.body.longitude+ "/"+ req.body.latitude + ".js?key=" + process.env.GEOCODE_API_KEY;
        return fetch(uri, {
                method: "GET",
                cors: true, 
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            })
            .then(function(response) {
                console.log("reverse geocode complete");
                return response.json();
            })
            .then(function(response) {
                res.status(201).json(response);
            })
            .catch((function(err) {
                res.status(500).json({"ok": false, "message": JSON.stringify(err)});
            }));
    }
    else {
        return res.status(403).json({"ok": false, "message": "Required parameters not found: latitude / longitude"});
    }

});


serv.post("/api/geocode", bodyParser.json(), function(req, res) {
    if (req.body.text) {
        console.log("starting geocode");
        var uri = "https://geocoder.tilehosting.com/q/"+req.body.text+".js?key=" + process.env.GEOCODE_API_KEY;
        return fetch(uri, {
                method: "GET",
                cors: true, 
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            })
            .then(function(response) {
                console.log("geocode complete");
                return response.json();
            })
            .then(function(response) {
                res.status(201).json(response);
            })
            .catch((function(err) {
                res.status(500).json({"ok": false, "message": JSON.stringify(err)});
            }));
    }
    else {
        return res.status(403).json({"ok": false, "message": "Required parameter not found: text"});
    }

})



httpServer.listen(http_port, function() {
    log.info("##############################################");
    log.info("Lantern Nexus Server");
    log.info("##############################################");
});