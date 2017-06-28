module.exports = saveSong;
const https = require('./HttpsHelper'),
    currentSong = require('./CurrentSong'),
    queryString = require('querystring'),
    oauth = require('./OAuthManager');

function buildUrlOptions() {
    return {
        method: "GET",
        hostname: "api.spotify.com"
    };
}

function searchSong(artist, name) {
    return oauth.getBearerToken().then(access_token => {
        
        var url_options = buildUrlOptions(),
            queries = {
                q: "artist:" + artist + " track:" + name,
                limit: 1,
                type: "track"
            };

        url_options.headers = {
            Authorization: "Bearer " + access_token
        };
        url_options.path = "/v1/search?" + queryString.stringify(queries); 

        return https(url_options).then(json => {
            console.debug('result from song search', json);
            if (json.tracks.items.length >= 1)
                return json.tracks.items[0].id;

            throw new Error('could not find song online');
        });
    });
}

function saveSongToSavedMusic(id) {
    return oauth.getBearerToken().then(access_token => {
        var url_options = buildUrlOptions();

        url_options.headers = {
            Authorization: "Bearer " + access_token
        };
        url_options.path = "/v1/me/tracks?ids=" + id;
        url_options.method = "PUT";

        return https(url_options).then(statusCode => {
            console.debug('status code of saving song', statusCode);
            if (statusCode !== 200)
                throw new Error("Unable to add song to saved music list");
        });
    });
}

function saveSong(){
    console.debug('saving song');
    // get the current song
    return currentSong().then(song => {
        console.debug('current song', song);
        if (song.id)
            return saveSongToSavedMusic(song.id).then(() => song);
        else {
            return searchSong(song.artist, song.name)
                .then(saveSongToSavedMusic)
                .then(() => song);
         }
    });
}