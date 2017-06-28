module.exports = server;
const manager = require('./OAuthManager'),
    http = require('http'),
    URL = require('url'),
    PORT = 5070;

// This module creates the server necessary for Oauth
function server(){
    return new Promise((resolve, reject) => {
        var httpServer = http.createServer((req, res) => {
            var url = URL.parse(req.url, true);
            
            if (url.pathname === "/authorize_callback"){
                res.writeHead(200, {'Content-Type': 'text/plain'});
                
                if (url.query.error === "access_denied"){
                    console.error("Authorization error", url.query.error);
                    res.end("Access denied. Please click \"accept\" if you wish to use this service. Retrying in 5 seconds.");
                    setTimeout(manager.requestAccess, 5000);
                    
                } else /* Success! */ {
                    manager.getTokenFromSpotify(url.query.code).then(() => {
                        httpServer.close();
                        res.end("You're all set!");
                    });
                } 
            }
        });
        
        httpServer.listen(PORT, listening => {
            resolve('listening on ' + PORT);
        });
    });
};