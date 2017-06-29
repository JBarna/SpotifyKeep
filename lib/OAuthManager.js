module.exports = {
    getBearerToken,
    getTokenFromSpotify,
    requestAccess
}

const URL = require('url'),
    fs = require('fs'),
    Lib = require('./');

// get the token or create the new object
var token,
    refreshPromise,
    OAuthInProgress = false;

function beginOAuth() {
    console.debug("Beginning OAuth");
    OAuthInProgress = true;
    Lib.OAuthServer().then(()=> {
        console.debug('requesting access');
        requestAccess();
    });
}

function requestAccess() {
    var requestUrl = URL.parse("https://accounts.spotify.com/authorize");
    requestUrl.query = {
        "client_id": "4d744c0865e941d6827fdad8343ba05c",
        "response_type": "code",
        "redirect_uri": "http://127.0.0.1:5070/authorize_callback",
        "scope": "user-library-modify"
    };
    
    // open a browser window to this URL
    console.debug("requestURL for ouath", requestUrl);
    Lib.BrowserManager.loadURL(requestUrl);
    
    // If the user doesn't accept, or closes... relaunch in 30 seconds.
    setTimeout( () => {
        if (OAuthInProgress) {
            requestAccess();
        }
    }, 30000 );
}

function buildUrlOptions() {
    return {
        hostname: "accounts.spotify.com",
        path: "/api/token",
        method: "POST",
        auth: "4d744c0865e941d6827fdad8343ba05c:e7c8c193e6cc48bd86ea8f7c13f1a1aa",
        headers: {
            // have to include this or all goes to shit.
            "Content-Type": "application/x-www-form-urlencoded",
        }
    };
}

function assignToToken(returnedData) {
    if (returnedData.refresh_token)
        token.refresh_token = returnedData.refresh_token;
    token.access_token = returnedData.access_token;
    token.token_time = Math.floor(Date.now() / 1000);
}

function getTokenFromSpotify(code) {
    var url_options = buildUrlOptions();
    dataToSend = "grant_type=authorization_code&code=" + code + "&redirect_uri=http://127.0.0.1:5070/authorize_callback";
    
    return Lib.HttpsHelper(url_options, dataToSend)
        .then(assignToToken)
        .then(writeTokenToFile)
        .then(() => OAuthInProgress = false);
}

function refreshToken() {
    refreshing = true;
    
    var url_options = buildUrlOptions(),
        dataToSend = "grant_type=refresh_token&refresh_token=" + token.refresh_token;
    
    return Lib.HttpsHelper(url_options, dataToSend)
        .then(assignToToken)
        .then(writeTokenToFile);
}

function getBearerToken() {
    if (typeof token === "undefined")
        loadTokenFromFile();

    if (typeof token.access_token === "undefined") {
        if (!OAuthInProgress)
            beginOAuth();
        return Promise.reject("Starting OAuth, no token available");
    } else {
        let currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - token.token_time >= 3600 ){
            if (!refreshPromise) {
                return refreshPromise = refreshToken().then(() => {
                    refreshPromise = null;
                    return token.access_token;
                });
            }
            return refreshPromise;
        } else 
            return Promise.resolve(token.access_token);
    }
}

function writeTokenToFile() {
    Lib.fsHelper.writeFile('token.json', token);
}

function loadTokenFromFile() {
    try {
        token = require('../token');
    } catch(e) { 
        token = {}; 
    }
}