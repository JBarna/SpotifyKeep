module.exports = {
    checkForUpdate
}

const Lib = require('./'),
    URL = require('url');

function checkForUpdate() {
    return new Promise(resolve => {
        var updateUrlOptions = URL.parse('https://api.github.com/repos/JBarna/SpotifyKeep/releases');
        updateUrlOptions.method = "GET";
        updateUrlOptions.headers = {
            'user-agent': 'This is SpotifyKeep, seeing if we have an update.'   
        };
    
        Lib.HttpsHelper.send(updateUrlOptions).then(data => {
            var releaseInfo = data[0],
            packageJSON = require(Lib.fs.getFullPath('package.json'));
            thisVersion = packageJSON.version.split('.').join('');
            releaseVersion = releaseInfo['tag_name'].split('.').join('');

            resolve({
                updateAvailable: releaseVersion > thisVersion,
                releaseInfo
            })
        });
    })
}