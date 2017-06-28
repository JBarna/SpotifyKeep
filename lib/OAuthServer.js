module.exports = server;
const Lib = require('./'),
    http = require('http'),
    URL = require('url'),
    PORT = 5070;

// This module creates the server necessary for Oauth
function server(){
    console.log('in server');
    return new Promise((resolve, reject) => {
        var httpServer = http.createServer((req, res) => {
            var url = URL.parse(req.url, true);
            console.debug("Received HTTP call", req.url, req.statusCode);
            
            if (url.pathname === "/authorize_callback"){
                res.writeHead(200, {'Content-Type': 'text/plain'});
                
                if (url.query.error === "access_denied"){
                    console.error("Authorization error", url.query.error);
                    res.end("Access denied. Please click \"accept\" if you wish to use this service. Retrying in 5 seconds.");
                    setTimeout(Lib.OAuthManager.requestAccess, 5000);
                    
                } else /* Success! */ {
                    Lib.OAuthManager.getTokenFromSpotify(url.query.code).then(() => {
                        httpServer.close();
                        res.end("You're all set!");
                    });
                } 
            }
        });
        
        httpServer.listen(PORT, () => {
            resolve('listening on ' + PORT);
        });
        
        setTimeout(() => {
            if (!httpServer.listening) {
                reject();
            }
        }, 5000);
    });
};