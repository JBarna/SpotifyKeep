// docs
// https://electron.atom.io/docs/api/global-shortcut/

const {app} = require('electron'),
    Lib = require('./lib');

// create our debug function if first command line argument is 'debug'
console.debug = process.argv[2] === 'debug' ? console.log.bind(null, "DEBUG") : Function.prototype;

// start our app
app.on('ready', () => {
    Lib.OAuthManager.getBearerToken().then(console.debug.bind(null, 'Initial Access Token'))
        .catch(console.debug);
        
    Lib.Hotkey(Lib.SaveSong);
});