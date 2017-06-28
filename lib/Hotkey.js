module.exports = hotkey;
const {globalShortcut, app} = require('electron'),
    Lib = require('./');

function hotkey(keyPressFn) {
    globalShortcut.register('Alt+`', () => {
        keyPressFn().then(Lib.Notification);
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll()
    })
}