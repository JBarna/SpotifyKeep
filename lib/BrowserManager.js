module.exports = {
    createWindow,
    loadURL,
    setupCommunication,
    loadFile
};

const {BrowserWindow, ipcMain} = require('electron'),
    URL = require('url'),
    Lib = require('./');

// keep our global reference so we don't get garbage collected
let win

function setupCommunication() {
    ipcMain.on('hotkey-communcation', (event, arg, data) => {
        if (arg === 'load-target-lists') {
            Lib.Playlist.GetWritablePlaylists().then(result => {
                const allOptions = [{ name: "Liked Songs", id: "Liked Songs" }, ...result]
                event.sender.send('hotkey-communcation', 'target-lists', allOptions)
            })
        }

        if (arg === 'load-existing-hotkeys') {
            event.sender.send('hotkey-communcation', 'existing-hotkeys', Lib.State.get(Lib.State.keys.HOTKEYS))
        }

        if (arg === 'hotkey-change') {
            var keys = Lib.State.get(Lib.State.keys.HOTKEYS)

            if (data.action === "remove") {
                let index = keys.indexOf(keys.find(key => key.hotkey === data.configuration.hotkey))
                keys.splice(index, 1)

            } else if (data.action === "add") {
                keys.push(data.configuration)
            }
            Lib.State.set(Lib.State.keys.HOTKEYS, keys)
            event.sender.send('hotkey-communcation', 'existing-hotkeys', keys)
        }
    })
}


function createWindow() {
    win = new BrowserWindow({width: 800, height: 600, center: true, minimizable: false, maximizable: false})

    win.on('closed', () => {
        // Dereference the window object
        win = null
    })
};

function loadURL(url) {
    if (!win)
        createWindow();

    win.loadURL(URL.format(url));
}

function loadFile(fileName) {
    if (!win)
        createWindow()

    win.loadURL(`file://${Lib.fs.getFullPath(fileName)}`)
    win.webContents.openDevTools()
}