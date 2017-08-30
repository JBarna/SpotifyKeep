var defaultState = {
    NOTIFICATION_SOUND_ON: true,
    REFRESH_TOKEN: null,
    ACCESS_TOKEN: null,
    TOKEN_TIME: 0,
    SAVED_SONGS_LIST: [],
    KEEP_PLAYLIST_SNAPSHOT: null,
    KEEP_PLAYLIST_LIST: [],
    USER_ID: null
}, 
keys = {},
state;

// set up our constants for outside access
for (var stateKey in defaultState) {
    keys[stateKey] = stateKey;
}

module.exports = { keys, get, set };
var Lib = require('./'),
    state;

function get(stateKey) {
    return loadState()[stateKey];
}

function set(stateKey, val) {
    if (!stateKey) {
        console.debug("Incorrect state key " + stateKey);
        return;
    }
    
    loadState()[stateKey] = val;
    Lib.fs.writeFile('./ApplicationState.json', state);
}

function loadState() {
    if (state)
        return state;

    try {
        state = require(Lib.fs.getFullPath('./ApplicationState.json'));
        state = Object.assign({}, defaultState, state);
    } catch(e) {
        state = defaultState;
    }

    return state;
}