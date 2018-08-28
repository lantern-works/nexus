var http = require("http");
var path = require("path");
var express = require("express");

// log facility
var log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'http.log',
    dateFormat:'YYYY.MM.DD'
});


// application server
var serv = express();
var static_path = path.resolve(__dirname, "public");
serv.use("/", express.static(static_path));
serv.disable("x-powered-by");

var http_port = process.env.VCAP_APP_PORT || process.env.PORT || 8080;
var httpServer = http.createServer(serv);


httpServer.listen(http_port, function() {
	log.info("##############################################");
	log.info("Lantern Nexus Server");
	log.info("##############################################");
});