// docs
// https://electron.atom.io/docs/api/global-shortcut/

const {app} = require('electron'),
    Lib = require('./lib');

console.debug = console.log;
app.on('ready', () => {
    Lib.OAuthManager.getBearerToken().then(token => console.log(token))
        .catch(Function.prototype);
    Lib.Hotkey(Lib.SaveSong);
});