module.exports = hotkey;
const {globalShortcut, app} = require('electron'),
    Lib = require('./');

function hotkey(keyPressFn) {
    globalShortcut.register('Alt+`', () => {
        keyPressFn().then(Lib.Notification, () => console.log("what the fuck"));
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll()
    })
}