module.exports = hotkey;
const {globalShortcut, app} = require('electron'),
    Lib = require('./');

function hotkey(keyPressFn) {
    var inProgress = false;

    globalShortcut.register('Alt+`', () => {
        if (!inProgress){
            inProgress = true;
            keyPressFn().then(Lib.Notification)
            .catch(console.debug.bind(null, 'error showing notification'))
            .then(() => inProgress = false);
        }
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll()
    })
}