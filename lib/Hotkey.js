module.exports = hotkey;
const {globalShortcut, app} = require('electron'),
    Lib = require('./');

function hotkey(keyPressFn) {

    const hotkeys = Lib.State.get(Lib.State.keys.HOTKEYS)
    hotkeys.map(hotkey => {
        var inProgress = false

        globalShortcut.register(hotkey.hotkey, () => {
            if (!inProgress){
                inProgress = true;
                keyPressFn(hotkey.target).then(Lib.Notification)
                .catch(console.debug.bind(null, 'error showing notification'))
                .then(() => inProgress = false);
            }
        })
    })

    app.on('will-quit', () => {
        // Unregister all shortcuts.
        globalShortcut.unregisterAll()
    })
}

hotkey.test = (hotkey, event) => {
    let reg
    
    try {
        reg = globalShortcut.register(hotkey, () => {
            console.log('hotkey', hotkey, 'was pressed')
        })
    } catch (error) {
        console.log('in catch')
    }
}