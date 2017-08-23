module.exports = {
    getBearerToken,
    getTokenFromSpotify,
    requestAccess
}

const URL = require('url'),
    Lib = require('./');

// get the token or create the new object
var refreshPromise,
    OAuthPromiseResolve;

function beginOAuth() {
    console.debug("Beginning OAuth");
    Lib.OAuthServer().then(() => {
        console.debug('requesting access');
        requestAccess();
    });

    return new Promise((resolve, reject) => OAuthPromiseResolve = resolve);
}

function requestAccess() {
    var requestUrl = URL.parse("https://accounts.spotify.com/authorize");
    requestUrl.query = {
        "client_id": "4d744c0865e941d6827fdad8343ba05c",
        "response_type": "code",
        "redirect_uri": "http://127.0.0.1:5070/authorize_callback",
        "scope": "user-library-modify user-library-read playlist-modify-public playlist-read-private playlist-modify-private user-read-currently-playing"
    };
    
    // open a browser window to this URL
    console.debug("requestURL for ouath", requestUrl);
    Lib.BrowserManager.loadURL(requestUrl);
    
    // If the user doesn't accept, or closes... relaunch in 30 seconds.
    setTimeout( () => {
        if (OAuthPromiseResolve) {
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

function saveToken(returnedData) {
    if (returnedData.refresh_token)
        Lib.State.set(Lib.State.keys.REFRESH_TOKEN, returnedData.refresh_token);
    Lib.State.set(Lib.State.keys.ACCESS_TOKEN, returnedData.access_token);
    Lib.State.set(Lib.State.keys.TOKEN_TIME, Math.floor(Date.now() / 1000));
}

function getTokenFromSpotify(code) {
    var url_options = buildUrlOptions();
    dataToSend = "grant_type=authorization_code&code=" + code + "&redirect_uri=http://127.0.0.1:5070/authorize_callback";
    
    return Lib.HttpsHelper.send(url_options, dataToSend)
        .then(saveToken)
        .then(() => {
            OAuthPromiseResolve(Lib.State.get(Lib.State.keys.ACCESS_TOKEN));
            OAuthPromiseResolve = false;
        });
}

function refreshToken() {
    refreshing = true;
    
    var url_options = buildUrlOptions(),
        dataToSend = "grant_type=refresh_token&refresh_token=" + Lib.State.get(Lib.State.keys.REFRESH_TOKEN);
    
    return Lib.HttpsHelper.send(url_options, dataToSend)
        .then(saveToken)
}

function getBearerToken() {
    var accessToken = Lib.State.get(Lib.State.keys.ACCESS_TOKEN);

    if (!accessToken) {
        if (!OAuthPromiseResolve)
            return beginOAuth();
        return Promise.reject("OAuth is already in progress.");
    } else {
        let currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - Lib.State.get(Lib.State.keys.TOKEN_TIME) >= 3600 ){
            if (!refreshPromise) {
                return refreshPromise = refreshToken().then(() => {
                    refreshPromise = null;
                    return Lib.State.get(Lib.State.keys.ACCESS_TOKEN);
                });
            }
            return refreshPromise;
        } else 
            return Promise.resolve(accessToken);
    }
}