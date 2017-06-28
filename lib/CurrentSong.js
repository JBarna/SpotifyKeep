module.exports = currentSong;
const childProcess = require('child_process'),
    {getTrack} = require('spotify-node-applescript'),
    EXEC_STRING = 'tasklist /fi "imagename eq spotify.exe" /fo list /v';

function currentSong(){
    return new Promise((resolve, reject) => {
        if (process.platform === "win32") {
            var windowTitle = childProcess.execSync(EXEC_STRING).toString();

            // we check for INFO because the default response from windows when spotify is not found is:
            // INFO: No tasks are running which match the specified criteria.
            if (windowTitle.indexOf("INFO") === 0)
                reject('Spotify not running');
            
            // There are multiple processes running for spotify, and they either have the 
            // window title of AngleHiddenWindow or OleMainThreadWndName
            // and we play process of elimation to find the remaining window title.
            windowTitle = windowTitle.split('\r\n')
                                .filter( line => line.indexOf("Window Title") === 0)
                                .map ( line => line.split(": ")[1] )
                                .filter( line => line !== "AngleHiddenWindow" && line !== "OleMainThreadWndName")
                                [0];
                                
            // If no song is playing but spotify is open, this is the window title
            if (windowTitle === "Spotify")
                reject('No song playing');
            
            else {
                var parts = windowTitle.split(" - ");
                resolve({
                    artist: parts[0],
                    name: parts[1]
                });
            }
        } else if (process.platform === 'darwin') 
            getTrack().then(resolve).catch(reject);
    });
}