const fs = require('fs');
const path = require('path');

async function readdir(dir) {
    let list = [];
    let files = await fs.readdirAsync(dir).catch(() => []);
    let dirs;

    function isDir(fname) {
        return fs.statSync(path.join(dir, fname)).isDirectory();
    }

    dirs = files.filter(isDir);

    files = files.filter(file => !isDir(file));
    files = files.map(file => path.join(dir, file));

    list = list.concat(files);

    while (dirs.length) {
        const l = await this.readdirRecursive(path.join(dir, dirs.shift()));
        list = list.concat(l);
    }

    return Promise.resolve(list);
}

module.exports = readdir;