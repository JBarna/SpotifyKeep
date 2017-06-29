module.exports = notification;
const {Notification, nativeImage} = require('electron');

var https = require('https');
var URL = require('url');



function notification(song) {
    console.log('praserp', URL.parse(song.album.images[2].url));
    //console.log("SONG", song);
    https.request( URL.parse(song.album.images[2].url), res => {
        var image = "";
        res.on('data', chunk => image += chunk);
        res.on('end', () => {
            var buf = Buffer.from(image);
            console.log(buf);
            var nat = nativeImage.createFromBuffer(buf, {width: 50, height: 50, scaleFactor: 1});
            console.log(nat.toJPEG(100));
            new Notification({
                title: 'Song Saved!',
                body: "Name: " + song.name + "\r\nArtist: " + song.artists[0].name,
                icon: nativeImage.createFromBuffer(buf)
            }).show();
        })
        // res.pipe(icon);
        // 
    }).end();

    // http.get(song.album.images[2].url, res => {
    //     res.pipe(icon);

    //     
    // });
}