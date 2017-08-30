module.exports = Playlist;

var Lib = require('./');

function Playlist() {
    return getUserPlaylists()
        .then(getKeepPlaylist)
        .then(keepPlaylist => Promise.all([keepPlaylist, getKeepPlaylistTracks(keepPlaylist)]))
        .then(saveSongsToKeepPlaylist)
        .catch(console.debug.bind('Error routinely checking saved songs and keep playlist'));
}

function getUserPlaylists() {
    console.debug('getting users playlists');
    return Lib.HttpsHelper.getList({
        path: '/v1/me/playlists',
        map: item => {
            return {
                id: item.id, 
                name: item.name
            }
        }
    });
}

function getKeepPlaylist(userPlaylists) {
    var keepPlaylist = userPlaylists.filter(item => item.name === "Keep")[0];

    if (keepPlaylist)
        return keepPlaylist;

    console.debug('creating keep playlist');
    return Lib.HttpsHelper.buildUrlOptions().then(createKeepPlaylistUrlOptions => {
        createKeepPlaylistUrlOptions.headers['Content-Type'] = "application/json";
        createKeepPlaylistUrlOptions.method = 'POST';
        createKeepPlaylistUrlOptions.path = `/v1/users/${Lib.State.get(Lib.State.keys.USER_ID)}/playlists`
        var playlistData = {
            name: "Keep",
            description: "A backup playlist created and maintained by SpotifyKeep. Find out more at www.github.com/JBarna/SpotifyKeep"
        }
        return Lib.HttpsHelper.send(createKeepPlaylistUrlOptions, JSON.stringify(playlistData)).then(response => {
            return { 
                id: response.id, 
                name: response.name
            };
        });
    });
}

function getKeepPlaylistTracks(keepPlaylist) {
    // get the snapshot of the playlist
    return Lib.HttpsHelper.buildUrlOptions().then(snapshotUrlOptions => {
        snapshotUrlOptions.path = `/v1/users/${Lib.State.get(Lib.State.keys.USER_ID)}/playlists/${keepPlaylist.id}?fields=snapshot_id`;
        return Lib.HttpsHelper.send(snapshotUrlOptions)
            .then(response => {
                console.debug('keep playlist snapshot id', response.snapshot_id);
                if (response.snapshot_id === Lib.State.get(Lib.State.keys.KEEP_PLAYLIST_SNAPSHOT))
                    return Lib.State.get(Lib.State.keys.KEEP_PLAYLIST_LIST);
                
                // new snapshot id -- playlist was changed outside of this application
                console.debug('loading keep playlist tracks');
                Lib.State.set(Lib.State.keys.KEEP_PLAYLIST_SNAPSHOT, response.snapshot_id);
                return Lib.HttpsHelper.getList({
                    path: `/v1/users/${Lib.State.get(Lib.State.keys.USER_ID)}/playlists/${keepPlaylist.id}/tracks`,
                    map: item => item.track.id
                }).then(list => {
                    Lib.State.set(Lib.State.keys.KEEP_PLAYLIST_LIST, list);
                    return list;
                });
            });
    });
}

function saveSongsToKeepPlaylist([keepPlaylist, keepPlaylistTracks]) {
    var tracksToKeepArray = [],
        savedTracks = Lib.State.get(Lib.State.keys.SAVED_SONGS_LIST);
    tracksToKeep = savedTracks.filter(track => keepPlaylistTracks.indexOf(track) === -1)
        .map(track => 'spotify:track:' + track)
        .reverse();

    console.debug(`There are ${tracksToKeep.length} tracks to be saved to Keep`);
    while (tracksToKeep.length > 0) {
        let restOfTracks = tracksToKeep.splice(100);
        tracksToKeepArray.push(tracksToKeep);
        tracksToKeep = restOfTracks;
    }
    return Promise.all(tracksToKeepArray.map(tracks => {
        return Lib.HttpsHelper.buildUrlOptions().then(keepUrlOptions => {
            keepUrlOptions.method = 'POST';
            keepUrlOptions.headers['Content-Type'] = "application/json";
            keepUrlOptions.path = `/v1/users/${Lib.State.get(Lib.State.keys.USER_ID)}/playlists/${keepPlaylist.id}/tracks`;

            return Lib.HttpsHelper.send(keepUrlOptions, JSON.stringify({uris: tracks}));
        });
    }));
}