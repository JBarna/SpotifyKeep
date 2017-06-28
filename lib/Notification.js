module.exports = notification;
const {Notification} = require('electron');

function notification(song) {
    new Notification({
        title: 'Song Saved!',
        body: "Name: " + song.name + "\r\nArtist: " + song.artist
    }).show();
}