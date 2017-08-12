module.exports = setupTray;

var {Menu, Tray, MenuItem, nativeImage} = require('electron'),
    Lib = require('./'),
    opener = require('opener'),
    URL = require('url'),
    tray = null,
    contextMenu;

function setupTray() {
    tray = new Tray(Lib.fsHelper.getFullPath('./Checkmark.png'));
    contextMenu = Menu.buildFromTemplate([
        {checked: true, label: 'Settings', icon: getIcon('wrench'), submenu: [
            {checked: true, type: 'checkbox', label: 'Check if song is already saved', sublabel: "Much faster without, but will move already saved songs to the top of your list"},
            {checked: true, type: 'checkbox', label: "Sound on notifications"}
        ]},
        {type: 'separator'},
        {label: 'About', icon: getIcon('about'), click: () => opener("https://github.com/JBarna/SpotifyKeep/blob/master/readme.md")},
        {label: 'Report an Issue', icon: getIcon('error'),  click: () => opener("https://github.com/JBarna/SpotifyKeep/issues")},
        {type: 'separator'},
        {label: 'Quit', icon: getIcon('skull'), role: 'quit'}
    ]);

    if (!~~(Math.random() * 15)) {
        contextMenu.insert(0, new MenuItem({
            label: "China #1", icon: getIcon('china')
        }));
    }

    tray.setToolTip('Google Music is for cucks');
    tray.setContextMenu(contextMenu);

    // check for update once we already created the core items
    checkForUpdate();
}

function getIcon(iconFileName) {
    var natImg = nativeImage.createFromPath(Lib.fsHelper.getFullPath(`/icons/${iconFileName}.png`))
        .resize({width: 25});
    
    if (natImg.isEmpty()) {
        console.debug("Could not load icon " + iconFileName);
    }

    return natImg;
}

function checkForUpdate() {
    var updateUrlOptions = URL.parse('https://api.github.com/repos/JBarna/SpotifyKeep/releases');
    updateUrlOptions.method = "GET";
    updateUrlOptions.headers = {
        'user-agent': 'This is SpotifyKeep, seeing if we have an update.'   
    };

    Lib.HttpsHelper.send(updateUrlOptions).then(data => {
        var releaseInfo = data[0],
        packageJSON = require(Lib.fsHelper.getFullPath('package.json'));
        thisVersion = packageJSON.version.split('.').join('');
        releaseVersion = releaseInfo['tag_name'].split('.').join('');

        if (releaseVersion > thisVersion) {
            // we have a release!
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
    });
}