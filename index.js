const {app, Menu, Tray} = require('electron'),
    Lib = require('./lib');

// create our debug function if first command line argument is 'debug'
console.debug = process.argv[2] === 'debug' ? console.log.bind(null, "DEBUG") : Function.prototype;


// start our app
app.on('ready', () => {
    Lib.OAuthManager.getBearerToken().then(console.debug.bind(null, 'Initial Access Token'))
        .catch(console.debug.bind(null, 'Error receiving first bearerToken'));
        
    Lib.Hotkey(Lib.SaveSong);
    setInterval(Lib.Playlist, 1000 * 60 * 5);
    Lib.Playlist();
});

app.on('window-all-closed', Function.prototype);