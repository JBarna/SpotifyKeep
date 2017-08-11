const {app, Menu, Tray} = require('electron'),
    Lib = require('./lib');

// create our debug function if first command line argument is 'debug'
console.debug = process.argv[2] === 'debug' ? console.log.bind(null, "DEBUG") : Function.prototype;

// start our app
app.on('ready', () => {
    Lib.OAuthManager.getBearerToken().then(token => {
        console.debug('Initial Access Token', token);
        Lib.Hotkey(Lib.SaveSong);
        setInterval(Lib.Playlist, 1000 * 60 * 10);
        Lib.Playlist();
    })
    .catch(console.debug.bind(null, 'Error receiving bearerToken'));
    Lib.Tray();
});

// prevents the shutdown of our application
// when the user closes our browser window
app.on('window-all-closed', Function.prototype);