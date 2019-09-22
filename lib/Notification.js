module.exports = notification;

const {Notification, nativeImage} = require('electron'),
    https = require('https'),  
    URL = require('url'),
    path = require('path'), 
    fs = require('fs'),
    Lib = require('./'),
    thumbPath = path.join(__dirname, '../thumb.jpg');

async function notification(song) {
    let nativeImage;
    
    try {
        nativeImage = !song.err && await getImage(song.album.images[2].url);
    } catch(err) {
        console.debug('Error retrieving album thumbnail', err);
    }
    showNotification(song, nativeImage);
}

function showNotification(song, image) {
    function buildBody() {
        if (song.err)
            return song.err

        var bodyParts = ['Track: ' + song.name, "Artist: " + song.artists[0].name]
        if (song.targetPlaylistName) {
            bodyParts.unshift('Playlist: ' + song.targetPlaylistName)
            bodyParts.pop()
        }

        return bodyParts.join("\r\n")
    }

    new Notification({
        title: song.err ? 'Song Not Saved 🖕' : 'Song Saved! 💪',
        body: buildBody(),
        icon: image,
        silent: !Lib.State.get(Lib.State.keys.NOTIFICATION_SOUND_ON)
    }).show();  
}

function getImage(url) {
    return new Promise((resolve, reject) => {
        console.debug("downloading thumbnail", url);
        https.request(URL.parse(url), res => {
            if (res.statusCode == 200) {
                if (fs.existsSync(thumbPath)) {
                    fs.unlinkSync(thumbPath);
                }
                var ws = fs.createWriteStream(thumbPath);
                ws.on('finish', () => {
                    var natImg = nativeImage.createFromPath(thumbPath);
                    if (!natImg.isEmpty()) {
                        resolve(natImg);
                    } else 
                        reject('Failed to load thumbnail from file');
                });
                res.pipe(ws);
            } else 
                reject('non 200 status code on album thumbnail');
        }).end();
    });
}