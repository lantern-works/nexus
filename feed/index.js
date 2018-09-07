var fs = require("fs");
var path = require("path");

var log = require("simple-node-logger").createSimpleLogger({
    logFilePath:'manager.log',
    dateFormat:'YYYY.MM.DD'
})

function onJobStart(results) {
	log.info(results);
}


// auto-load middleware
var files = fs.readdirSync(path.resolve(__dirname, "./job"));
files.forEach(function(file)  {
    log.debug("[data] " + file);
    var loader = require("./job/" + file);

    loader.start.bind(this, onJobStart, function() {
    	log.debug("first job complete for: " + file);

    	// now loop the job
		setInterval(loader.start.bind(this,onJobStart, function() {
			console.log("repeat job complete for: " + file);
		}), loader.timer * 1000);
    })();

});
