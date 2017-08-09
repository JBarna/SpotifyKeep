var packager = require('electron-packager'),
    path = require('path');

var options = {
    dir: __dirname,
    out: 'out',
    arch: 'all',
    download: {
        cache: path.join(__dirname, '..')
    }, 
    icon: './Checkmark',
    overwrite: true,
    electronVersion: '1.7.3',
    ignore: [
        /\/token.json/,
        /\/thumb.*/
    ]
};

packager(options, (err, paths) => {
    if (err)
        console.log("Error creating package", err);
    else
        console.log('Success creating package', paths);
});