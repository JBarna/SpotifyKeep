module.exports = saveSong;
const queryString = require('querystring'), 
    Lib = require('./');

var songPromise,
    songInfo;

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

function getAdditionalSongInfo(id) {
    return buildUrlOptions().then(url_options => {
        url_options.path = "/v1/tracks/" + id;

        return Lib.HttpsHelper(url_options).then(json => {
            songInfo = json;
            return json.id;
        }, err => {
            console.debug('Could not get additional info for song', songInfo, reason);
            throw new Error(reason);
        });
    });
}

function searchSong(artist, name) {
    return buildUrlOptions().then(url_options => {
        var queries = {
            q: "artist:" + artist + " track:" + name,
            limit: 1,
            type: "track"
        };
        url_options.path = "/v1/search?" + queryString.stringify(queries); 

        return Lib.HttpsHelper(url_options).then(json => {

            if (json.tracks.items.length >= 1) {
                songInfo = json.tracks.items[0];
                console.debug('Result from song search', songInfo);
                return songInfo.id;
            }

            throw new Error('Could not find song online');
        });
    });
}

function saveSongToSavedMusic(id) {
    return buildUrlOptions().then(url_options => {
        url_options.path = "/v1/me/tracks?ids=" + id;
        url_options.method = "PUT";

        return Lib.HttpsHelper(url_options).then(statusCode => {
            console.debug('status code of saving song', statusCode);
            if (statusCode !== 200)
                throw new Error("Unable to add song to saved music list");
        });
    });
}

function saveSong(){
    if (!songPromise) {
        console.debug('Saving Song');
        return songPromise = Lib.CurrentSong().then(song => {
            console.debug('Current Song', song);
            songInfo = song;

            if (song.id)
                return getAdditionalSongInfo(song.id)
                    .then(saveSongToSavedMusic);
            else {
                return searchSong(song.artist, song.name)
                    .then(getAdditionalSongInfo)
                    .then(saveSongToSavedMusic);
            }
        }, err => {
            console.debug("error saving song:", err);
            songInfo = {err};
        }).then(() => {
            songPromise = null;
            return songInfo;
        });
    }
    return songPromise;
}