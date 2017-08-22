module.exports = {
    save: saveSong,
    init: refreshSongsFromServer
}

const Lib = require('./'),
    querystring = require('querystring');

var refreshAfterSave = false;

function refreshSongsFromServer() {
    return Lib.HttpsHelper.getList({
        path: '/v1/me/tracks',
        map: item => item.track.id
    }).then(list => {
        Lib.State.set(Lib.State.keys.SAVED_SONGS_LIST, list);
        return list;
    });
}

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

function saveSongToSavedMusic([currentSong, songList]) {
    return Lib.HttpsHelper.buildUrlOptions().then(url_options => {
        url_options.path = "/v1/me/tracks?ids=" + currentSong.id;
        url_options.method = "PUT";

        return Lib.HttpsHelper.send(url_options).then(statusCode => {
            console.debug('status code of saving song', statusCode);
            if (statusCode !== 200)
                return Promise.reject("Unable to add song to saved music list");

            // update the song list
            songList.unshift(currentSong.id);
            Lib.State.set(Lib.State.keys.SAVED_SONGS_LIST, songList);
            return currentSong;
        });
    });
}

function checkIfSongIsAlreadySaved([currentSong, songList]) {
    var songIndex = songList.indexOf(currentSong.id);
    if (songIndex === -1) {
        // completely new song, go ahead and save
        refreshAfterSave = false;
        return [currentSong, songList];
    } else { 
        // Our cached version of the song list has this song already,
        // so make a request for 50 songs around it's cached position to see if it's still there
        return Lib.HttpsHelper.buildUrlOptions().then(urlOptions => {
            var queries = {
                limit: 50,
                offset: songIndex - 25 < 0 ? 0 : songIndex - 25
            };
            urlOptions.path = '/v1/me/tracks?' + querystring.stringify(queries);
            return Lib.HttpsHelper.send(urlOptions).then(songListSection => {
                songListSection = songListSection.items.map(item => item.track.id);
                
                var updatedSongIndex = songListSection.indexOf(currentSong.id);
                if (updatedSongIndex === -1) {
                    // not there, proceed with saving
                    refreshAfterSave = true;
                    return [currentSong, songList];
                } else {
                    // check to see if the index's are the same, if not, then the saved list
                    // has been modified in some way and we must refresh it. 
                    if (updatedSongIndex + queries.offset !== songIndex) {
                        console.debug('Existing index does not match', songIndex, updatedSongIndex + queries.offset);                        
                        refreshSongsFromServer();
                    }
                    return Promise.reject('Song is already saved');
                }
            })
        });
    }
}

function saveSong(){
    var saveSongPromise;
    console.debug('Saving Song');

    return Promise.all([getCurrentSong(), Lib.State.get(Lib.State.keys.SAVED_SONGS_LIST)])
        .then(checkIfSongIsAlreadySaved)
        .then(saveSongToSavedMusic)
        //.then(Lib.Playlist.saveSongToPlaylist)
        .then(song => {
            if (refreshAfterSave) {
                refreshSongsFromServer();
            }
            return song;
        })
        .catch(err => {
            console.debug("error saving song:", err);
            return {err};
        });
}