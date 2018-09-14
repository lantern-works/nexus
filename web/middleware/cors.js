module.exports = function CORSMiddleware(req, res, next) {
  
    process.env.ORIGINS = process.env.ORIGINS +",localhost,localhost:3000,lantern-nexus-web-intelligent-chipmunk.mybluemix.net";
    var allowed_origins = process.env.ORIGINS.split(",");
    try {
        if (req.headers.origin) {  
            var origin = req.headers.origin.split("://")[1];
            if(allowed_origins.indexOf(origin) > -1){
                var protocol = (req.secure ? "https://" : "http://");
                res.setHeader('Access-Control-Allow-Origin', protocol+origin);
            }
        }
    }
    catch(e) {
        log.error(e);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, authorization, x-requested-with, x-http-method-override, content-type, origin, referer, x-csrf-token');
    res.header('Access-Control-Allow-Credentials', true);

    //intercepts OPTIONS method
    if ('OPTIONS' === req.method) {
      //respond with 200
      res.status(200).send();
    }
    else {
    //move on
      next();
    }
};