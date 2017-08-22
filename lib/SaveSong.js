module.exports = saveSong;

const Lib = require('./');

function getCurrentSong() {
    return Lib.HttpsHelper.buildUrlOptions().then(url_options => {
        url_options.path = '/v1/me/player/currently-playing';
        return Lib.HttpsHelper.send(url_options).then(song => {

            console.debug('Current Song', song);
            if (!song.is_playing || !song.item) {
                return Promise.reject('No song is playing');
            }
            return Promise.resolve(song.item);
        });
    })
}

function saveSongToSavedMusic(song) {
    return Lib.HttpsHelper.buildUrlOptions().then(url_options => {
        url_options.path = "/v1/me/tracks?ids=" + song.id;
        url_options.method = "PUT";

        return Lib.HttpsHelper.send(url_options).then(statusCode => {
            console.debug('status code of saving song', statusCode);
            if (statusCode !== 200)
                return Promise.reject("Unable to add song to saved music list");

            return song;
        });
    });
}

function checkIfSongIsAlreadySaved([currentSong, items]) {
    if (items.indexOf(currentSong.id) === -1) {
        return Promise.resolve(currentSong);
    }
    return Promise.reject('Song is already saved');
}

function saveSong(){
    var saveSongPromise;
    console.debug('Saving Song');

    var allArray = [getCurrentSong()],
        checkSongs = Lib.State.get(Lib.State.keys.CHECK_SONGS_ON_SAVE);

    if (checkSongs) {
        allArray.push(Lib.HttpsHelper.getList({
            path: '/v1/me/tracks',
            map: item => item.track.id
        }));
    }
    
    return Promise.all(allArray)
        .then(checkSongs ? checkIfSongIsAlreadySaved : ([currentSong]) => currentSong)
        .then(saveSongToSavedMusic)
        //.then(Lib.Playlist.saveSongToPlaylist)
        .catch(err => {
            console.debug("error saving song:", err);
            return {err};
        });
}