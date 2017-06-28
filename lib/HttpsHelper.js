module.exports = helper;
var https = require('https');

/* This module provides the logic to make an HTTPS request
* It catches errors thrown by Spotify and it also handles
* any error specific to the network request (ie being offline)
*
* Also sends any data assuming it is a post request */

function helper(url_options, dataToSend) {
    return new Promise((resolve, reject) => {

        var req = https.request(url_options, res => {
            if (res.statusCode != 200){
                console.debug('failed https request', url_options);
                console.error("Https request returned with non 200 statusCode: " + res.statusCode);
                reject("Https request returned with non 200 statusCode: " + res.statusCode);
                return;
            }
                
            /* All is fine */
            var returnedData = "";
            res.setEncoding('utf8');
            res.on('data', chunk => returnedData += chunk);
            res.on('end', () => {
                if (returnedData.length > 0)
                    resolve(JSON.parse(returnedData));
                else 
                    resolve(res.statusCode);
            });
        });
        
        req.on('error', err => {
            if (err & err.code !== 'ENOENT'){
                // we have an error other than not being able to connect to the internet
                reject(err);    
            }
        });
        
        req.end(dataToSend);
    });
}