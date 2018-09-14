const http = require("http");
const fs = require("fs");
const path = require("path");
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
    console.log(req.body)
    if (req.body.text) {
        console.log("sending message: " + req.body.text);
        assistant.message({
        	workspace_id: assistant_workspace,
        	input: {'text': req.body.text}
        },  function(err, response) {
        	if (err) {
                console.error(err);
        	   return res.status(500).json({"ok": false, "message": err});
        	}
        	else {
                console.log(response);
        	   res.status(201).json(response);
        	}
        });
    }
    else {
        return res.status(403).json({"ok": false, "message": "Required parameter not found: text"});
    }
});



httpServer.listen(http_port, function() {
    log.info("##############################################");
    log.info("Lantern Nexus Server");
    log.info("##############################################");
});