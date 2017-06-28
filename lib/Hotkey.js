module.exports = hotkey;
const {globalShortcut, app} = require('electron'),
    notifs = require('./Notification');

function hotkey(keyPressFn) {
    globalShortcut.register('Alt+`', () => {
        keyPressFn().then(notifs);
    });

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll()
    })
}