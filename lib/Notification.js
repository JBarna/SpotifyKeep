module.exports = notification;

const {Notification, nativeImage} = require('electron'),
    https = require('https'),  
    URL = require('url'),
    path = require('path'), 
    fs = require('fs'),
    thumbPath = path.join(__dirname, '../thumb.jpg');



function notification(song) {
    if (process.platform === "win32") {
        showNotification(song);
    } else {
        getImage(song.album.images[2].url)
            .then(showNotification)
            .catch(err => {
                console.debug('Error retrieving album thumbnail', err);
                showNotification(song);
            });
    }
}

function showNotification(song, image) {
    new Notification({
        title: 'Song Saved!',
        body: 'Track: ' + song.name + "\r\nArtist: " + song.artists[0].name,
        icon: image
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