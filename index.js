const {app, Menu, Tray, BrowserWindow, ipcMain} = require('electron'),
    Lib = require('./lib');

let mainWindow

// create our debug function if first command line argument is 'debug'
console.debug = process.argv[2] === 'debug' ? console.log.bind(null, "DEBUG") : Function.prototype;

// start our app
app.on('ready', () => {
    Lib.BrowserManager.setupCommunication()

    Lib.OAuthManager.getBearerToken()
        .then(() => Promise.all([fetchUserData(), Lib.SaveSong.init()]))
        .then(() => {
            Lib.Hotkey(Lib.SaveSong.save);
            setInterval(Lib.Playlist.BackupToKeep, 1000 * 60 * 30); // check every thirty minutes
            Lib.Playlist.BackupToKeep();
        })
        .catch(console.debug.bind(null, 'Error receiving bearerToken or userInfo'));
    Lib.Tray();
});

ipcMain.on('hotkey', (event, arg) => Lib.Hotkey.test(arg, event))

function fetchUserData() {
    // only load this information if we don't have it
    if (Lib.State.get(Lib.State.keys.USER_ID) == null) {
        return Lib.HttpsHelper.buildUrlOptions()
            .then(userUrlOptions => {
                userUrlOptions.path = '/v1/me';
                return Lib.HttpsHelper.send(userUrlOptions);
            }).then(userInfo => {
                Lib.State.set(Lib.State.keys.USER_ID, userInfo.id);
            });
    }
}

// prevents the shutdown of our application
// when the user closes our browser window
app.on('window-all-closed', Function.prototype);

// stop chrome from saving processing power in the background 
// without this the save can take >30 seconds to complete on mac
app.commandLine.appendSwitch("disable-renderer-backgrounding");