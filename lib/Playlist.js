module.exports = {repeat, saveSongToPlaylist};

var Lib = require('./');

function repeat() {
    console.debug('beginning the playlist repeat function');
    return getUserInfoAndKeepPlaylist()
        .then(([userInfo, keepPlaylist]) => {
            return Promise.all([
                userInfo,
                keepPlaylist,
                Lib.HttpsHelper.getList({
                    path: '/v1/me/tracks',
                    map: item => item.track.id
                }),
                Lib.HttpsHelper.getList({
                    path: `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`,
                    map: item => item.track.id
                })
            ]);
        }).then(([userInfo, keepPlaylist, savedTracks, keepPlaylistTracks]) => {
            var tracksToKeepArray = [],
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
                    keepUrlOptions.path = `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`;

                    return Lib.HttpsHelper.send(keepUrlOptions, JSON.stringify({uris: tracks}));
                });
            }));
        }).catch(console.debug.bind('Error routinely checking saved songs and keep playlist'));
}

// This function is currently out of commission,
// I have no idea why the request doesn't return. 
// I pasted the exact deleteUrlData that I used on the spotify website, which worked, and I know it's being sent over, so I have no idea
// what I did differently (if anything);
function saveSongToPlaylist(song) {
    return getUserInfoAndKeepPlaylist()
        .then(([userInfo, keepPlaylist]) => {
            // delete the song from the playlist to avoid duplicates
            return Lib.HttpsHelper.buildUrlOptions().then(deleteUrlOptions => {
                deleteUrlOptions.method = 'DELETE';
                deleteUrlOptions.headers['Content-Type'] = "application/json";
                deleteUrlOptions.path = `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`;
                var deleteUrlData = {
                    tracks: [{ uri: "spotify:track:" + song.id }]
                };
                return Lib.HttpsHelper.send(deleteUrlOptions, JSON.stringify(deleteUrlData));
            }).then(() => {
                // add the song back in
                return Lib.HttpsHelper.buildUrlOptions().then(keepUrlOptions => {
                    keepUrlOptions.method = 'POST';
                    keepUrlOptions.headers['Content-Type'] = "application/json";
                    keepUrlOptions.path = `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`;
                    return Lib.HttpsHelper.send(keepUrlOptions, {uris: ['spotify:track:' + song.id]})
                });
            });
        }).then(() => {
            console.debug('successfully saved ' + song.name + ' to the Keep playlist after saving');
            return song;
        }).catch(err => {
            console.debug('Error saving saved song to keep playlist', err);
            return song;
        });
}

function getUserInfoAndKeepPlaylist() {
    return Lib.HttpsHelper.buildUrlOptions()
        .then(userUrlOptions => {
            userUrlOptions.path = '/v1/me';

            return Promise.all([
                Lib.HttpsHelper.send(userUrlOptions),
                Lib.HttpsHelper.getList({
                    path: '/v1/me/playlists',
                    map: item => {
                        return {
                            id: item.id, 
                            name: item.name
                        }
                    }
                })
            ]);
        }).then(([userInfo, userPlaylists]) => {
            var keepPlaylist = userPlaylists.filter(item => item.name === "Keep")[0];

            if (keepPlaylist)
                return [userInfo, keepPlaylist];
            
            return Lib.HttpsHelper.buildUrlOptions().then(createKeepPlaylistUrlOptions => {
                createKeepPlaylistUrlOptions.headers['Content-Type'] = "application/json";
                createKeepPlaylistUrlOptions.method = 'POST';
                createKeepPlaylistUrlOptions.path = `/v1/users/${userInfo.id}/playlists`
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
            }).then(createdPlaylist => [userInfo, createdPlaylist]);
        });
}