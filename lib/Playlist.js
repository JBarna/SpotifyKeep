module.exports = playlist;

var Lib = require('./');

function playlist() {
    
    // get the users' ID https://api.spotify.com/v1/me

    // add a track to the playlist 
    //https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks

    // get the playlists
    //https://api.spotify.com/v1/me/playlists

    // https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks 
    // get the playlist tracks

    Lib.HttpsHelper.buildUrlOptions()
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
            ]).then(([userInfo, userPlaylists]) => {
                var keepPlaylist = userPlaylists.filter(item => item.name === "Keep")[0];

                if (!keepPlaylist) 
                    return Promise.reject(`There is no Keep playlist on ${userInfo.display_name}'s account`);
                    
                return Promise.all([
                    Lib.HttpsHelper.getList({
                        path: '/v1/me/tracks',
                        map: item => item.track.id
                    }),
                    Lib.HttpsHelper.getList({
                        path: `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`,
                        map: item => item.track.id
                    })
                ]).then(([savedTracks, keepPlaylistTracks]) => {
                    var tracksToKeepArray = [],
                        tracksToKeep = savedTracks.filter(track => keepPlaylistTracks.indexOf(track) === -1)
                            .map(track => 'spotify:track:' + track)
                            .reverse();

                    while (tracksToKeep.length > 0) {
                        let restOfTracks = tracksToKeep.splice(100);
                        tracksToKeepArray.push(tracksToKeep);
                        tracksToKeep = restOfTracks;
                    }

                    return Promise.all(tracksToKeepArray.map(tracks => {
                        return Lib.HttpsHelper.buildUrlOptions().then(keepUrlOptions => {
                            keepUrlOptions.method = 'POST';
                            keepUrlOptions.path = `/v1/users/${userInfo.id}/playlists/${keepPlaylist.id}/tracks`;

                            return Lib.HttpsHelper.send(keepUrlOptions, JSON.stringify({uris: tracks}));
                        });
                    }));
                });
            });
        });
}