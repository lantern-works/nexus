var http = require("http");
var path = require("path");
var fs = require("fs");
var path = require("path");
var express = require("express");

//--------------------------------------------------------------- Log Facility
var log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'http.log',
    dateFormat:'YYYY.MM.DD'
});



//------------------------------------------------------------------- Helpers

// auto-load middleware
function beginDataImports() {
	var data_files = fs.readdirSync(path.resolve(__dirname, "./data"));
	data_files.forEach(function(file)  {
	    log.debug("[data] " + file);
	    var loader = require("./data/" + file);
		setInterval(loader.start.bind(this,onJobStart,onJobComplete), loader.timer * 1000);
	});
}

function onJobStart(results) {
	log.info(results);
}

function onJobComplete(results) {
	log.info("data job complete", results);
}



//----------------------------------------------------------------- App Server
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
	beginDataImports();
});