constants = {
    NOTIFICATION_SOUND_ON: 'NOTIFICATION_SOUND_ON',
    CHECK_SONGS_ON_SAVE: 'CHECK_SONGS_ON_SAVE'
};

module.exports = { constants, getSetting, setSetting };
var Lib = require('./'),
    userSettings;

function getSetting(setting) {
    return loadUserSettings()[setting];
}

function setSetting(setting, val) {
    loadUserSettings()[setting] = val;
    Lib.fs.writeFile('./usersettings.json', userSettings);
}

function loadUserSettings() {
    if (userSettings)
        return userSettings;

    try {
        userSettings = require(Lib.fs.getFullPath('./usersettings.json'));
    } catch(e) {
        userSettings = {
            // defaults
            [constants.NOTIFICATION_SOUND_ON]: true,
            [constants.CHECK_SONGS_ON_SAVE]: true
        };
    }

    return userSettings;
}