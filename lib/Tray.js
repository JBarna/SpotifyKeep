module.exports = setupTray;

var {Menu, Tray, MenuItem, nativeImage} = require('electron'),
    Lib = require('./'),
    opener = require('opener'),
    URL = require('url'),
    tray = null,
    contextMenu;

function setupTray() {
    tray = new Tray(Lib.fs.getFullPath('./icons/Checkmark.png'));
    contextMenu = Menu.buildFromTemplate([
        {checked: true, label: 'Settings', icon: getIcon('wrench'), submenu: [
            {
                checked: Lib.State.get(Lib.State.keys.NOTIFICATION_SOUND_ON), 
                type: 'checkbox', label: "Notifications have sound",
                click: updateSetting.bind(null, Lib.State.keys.NOTIFICATION_SOUND_ON)
            },
            {type: 'separator'},
            {
                type: 'normal', label: "Change Hotkey", sublabel: `Current: ${Lib.Hotkey.getHotkey()}`,
                click: () => Lib.Hotkey.change()
            }
        ]},
        {type: 'separator'},
        {label: 'About', icon: getIcon('about'), click: () => opener("https://github.com/JBarna/SpotifyKeep/blob/master/readme.md")},
        {label: 'Report an Issue', icon: getIcon('error'),  click: () => opener("https://github.com/JBarna/SpotifyKeep/issues")},
        {type: 'separator'},
        {label: 'Quit', icon: getIcon('skull'), role: 'quit'}
    ]);

    if (!~~(Math.random() * 15)) {
        contextMenu.insert(0, new MenuItem({
            label: "China #1", icon: getIcon('china'), click: menuItem => menuItem.visible = false
        }));
    }

    tray.setToolTip('Google Music is for cucks');
    tray.setContextMenu(contextMenu);

    // check for update once we already created the core items
    Lib.Updater.checkForUpdate().then(handleAvailableRelease);
}

function updateSetting(setting, menuItem) {
    Lib.State.set(setting, menuItem.checked);
}

function getIcon(iconFileName) {
    var natImg = nativeImage.createFromPath(Lib.fs.getFullPath(`/icons/${iconFileName}.png`))
        .resize({width: 25});
    
    if (natImg.isEmpty()) {
        console.debug("Could not load icon " + iconFileName);
    }

    return natImg;
}

function handleAvailableRelease({ releaseInfo, updateAvailable }) {
    if (updateAvailable) {
        var updateMenuItem = new MenuItem({
            label: 'Update Available!',
            sublabel: releaseInfo.name,
            click: () => opener(releaseInfo.html_url),
            icon: getIcon(`release${~~(Math.random() * 5) + 1}`)
        });
        contextMenu.insert(0, new MenuItem({type: 'separator'}));
        contextMenu.insert(0, updateMenuItem);
        tray.setContextMenu(contextMenu);
    }
}