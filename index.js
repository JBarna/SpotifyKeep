// docs
// https://electron.atom.io/docs/api/global-shortcut/

const {app} = require('electron'),
    {Hotkey, OAuthManager, SaveSong} = require('./lib');

console.debug = console.log;
app.on('ready', () => {
    OAuthManager.getBearerToken()
        .catch(Function.prototype);
    Hotkey(SaveSong);
});