module.exports = playlist;

var Lib = require('./');

function playlist() {

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
            
        }).then(([userInfo, keepPlaylist]) => {
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
        }).catch(console.debug.bind('Error saving songs to playlist'));
}