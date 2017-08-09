module.exports = setupTray;

var {Menu, Tray} = require('electron'),
    path = require('path'),
    Lib = require('./'),
    tray = null;

function setupTray() {
    tray = new Tray(path.join(__dirname, '../Checkmark.png'));
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Show Spotify Keep', click: () => Lib.BrowserManager.loadURL("https://www.google.com")},
        {type: 'separator'},
        {label: 'Quit', role: 'quit'}
    ])

    // Call this again for Linux because we modified the context menu
    tray.setToolTip('This is my awesome tooltip');
    tray.setContextMenu(contextMenu);
}