module.exports = {
    createWindow: createWindow,
    loadURL: loadURL
};

const {BrowserWindow} = require('electron'),
    URL = require('url');

// keep our global reference so we don't get garbage collected
let win;

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