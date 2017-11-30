const {app, Menu, Tray} = require('electron'),
    Lib = require('./lib');

// create our debug function if first command line argument is 'debug'
console.debug = process.argv[2] === 'debug' ? console.log.bind(null, "DEBUG") : Function.prototype;

// start our app
app.on('ready', async () => {

    try {
        await Lib.OAuthManager.getBearerToken();
        await fetchUserData();
        await Lib.SaveSong.init();
    } catch(err) {
        console.debug('Error receiving bearerToken or userInfo', err);
    }

    Lib.Hotkey(Lib.SaveSong.save);
    setInterval(Lib.Playlist, 1000 * 60 * 10);
    Lib.Playlist();
    Lib.Tray();
});

async function fetchUserData() {
    // only load this information if we don't have it
    if (Lib.State.get(Lib.State.keys.USER_ID) == null) {
        let userUrlOptions = await Lib.HttpsHelper.buildUrlOptions()
        userUrlOptions.path = '/v1/me';

        let userInfo = await Lib.HttpsHelper.send(userUrlOptions);
        Lib.State.set(Lib.State.keys.USER_ID, userInfo.id);
    }
}

// prevents the shutdown of our application
// when the user closes our browser window
app.on('window-all-closed', Function.prototype);

// stop chrome from saving processing power in the background 
// without this the save can take >30 seconds to complete on mac
app.commandLine.appendSwitch("disable-renderer-backgrounding");