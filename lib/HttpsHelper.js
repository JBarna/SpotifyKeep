module.exports = {buildUrlOptions, getList, send};

var https = require('https'),
    URL = require('url'),
    querystring = require('querystring'),
    Lib = require('./');

/* This module provides the logic to make an HTTPS request
* It catches errors thrown by Spotify and it also handles
* any error specific to the network request (ie being offline)
*
* Also sends any data assuming it is a post request */

function buildUrlOptions() {
    return Lib.OAuthManager.getBearerToken().then(access_token => {
        return {
            method: "GET",
            hostname: "api.spotify.com",
            headers: {
                Authorization: "Bearer " + access_token
            }
        };
    });
}

function getList({path, map}, items, offset) {
    return buildUrlOptions().then(url_options => {
        var queries = { 
            limit: 50
        };
        if (offset) queries.offset = offset;
        url_options.path = path + '?' + querystring.stringify(queries);
        console.debug(path + ' offset', offset);

        return send(url_options).then(result => {
            var resultItems = map ? result.items.map(map) : result.items;
            if (!items) items = [];
            items = items.concat(resultItems);
            if (result.next) {
                let newOffset = URL.parse(result.next, true).query.offset;
                return getList({path, map}, items, newOffset);
            }
            return items;
        });
    });
}

function send(url_options, dataToSend) {
    return new Promise((resolve, reject) => {

        var req = https.request(url_options, res => {
                
            /* All is fine */
            var returnedData = "";
            res.setEncoding('utf8');
            res.on('data', chunk => returnedData += chunk);
            res.on('end', () => {

                if (res.statusCode != 200 && res.statusCode != 201){
                    console.debug('failed https request', res.statusCode, url_options);
                    reject("Https request returned with non 200 statusCode: " + res.statusCode + ": returned data : " + returnedData);
                } else if (returnedData.length > 0)
                    resolve(JSON.parse(returnedData));
                else 
                    resolve(res.statusCode);
            });
        });
        
        req.on('error', err => {
            if (err && err.code === 'ENOENT') {
                reject('No online connection');
                // we have an error other than not being able to connect to the internet
            } else {
                reject(err);    
            }
        });
        
        req.end(dataToSend);
    });
}