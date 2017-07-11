module.exports = saveSong;

const Lib = require('./'),
    URL = require('url'),
    querystring = require('querystring');

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

function getCurrentSong() {
    return buildUrlOptions().then(url_options => {
        url_options.path = '/v1/me/player/currently-playing';
        return Lib.HttpsHelper(url_options).then(song => {

            console.debug('Current Song', song);
            if (!song.is_playing || !song.item) {
                return Promise.reject('No song is playing');
            }
            return Promise.resolve(song.item);
        });
    })
}

function saveSongToSavedMusic(song) {
    return buildUrlOptions().then(url_options => {
        url_options.path = "/v1/me/tracks?ids=" + song.id;
        url_options.method = "PUT";

        return Lib.HttpsHelper(url_options).then(statusCode => {
            console.debug('status code of saving song', statusCode);
            if (statusCode !== 200)
                return Promise.reject("Unable to add song to saved music list");

            return song;
        });
    });
}

function getSavedSongs(currentSong, items, offset) {
    return buildUrlOptions().then(url_options => {
        var queries = { 
            limit: 50
        };
        if (offset) queries.offset = offset;
        url_options.path = '/v1/me/tracks?' + querystring.stringify(queries);
        console.debug('saved song offset', offset);

        return Lib.HttpsHelper(url_options).then(songList => {
            if (!items) items = [];
            items = items.concat(songList.items.map(item => item.track.id));

            if (songList.next) {
                let newOffset = URL.parse(songList.next, true).query.offset;
                return getSavedSongs(currentSong, items, newOffset);
            }
            return {currentSong, items};
        });
    });
}

function checkIfSongIsAlreadySaved({currentSong, items}) {
    if (items.indexOf(currentSong.id) === -1) {
        return Promise.resolve(currentSong);
    }
    return Promise.reject('Song is already saved');
}

function saveSong(){
    console.debug('Saving Song');
    return getCurrentSong()
        .then(getSavedSongs)
        .then(checkIfSongIsAlreadySaved)
        .then(saveSongToSavedMusic)
        .catch(err => {
            console.debug("error saving song:", err);
            return {err};
        }).then(result => {
            songPromise = null;
            return result;
        })
}