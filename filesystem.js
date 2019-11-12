const fs = require('fs');

function read(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, str) => {
            if (err) reject(err);
            resolve(str);
        });
    });
}

function readAll(filenames) {
    return Promise.all(filenames.map(read));
}

function write(filename, contents) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, contents, 'utf8', (err, str) => {
            if (err) reject(err);
            resolve(str);
        });
    });
}

function writeAll(filenames) {
    return Promise.all(filenames.map(f => write(...f)));
}

/**
 * Recursively finds .vue files in a given directory
 *
 * Returns an array of their paths relative to (and including) the given directory
 * e.g., vueFilesIn('src') => ['src/App.vue', 'src/components/HelloWorld.vue']
 **/
function vueFilesIn(dir) {
    const allContents = fs.readdirSync(dir, { withFileTypes: true });
    const currFiles =  allContents
        .filter(f => !f.isDirectory() && f.name.endsWith('.vue'))
        .map(f => `${dir}/${f.name}`);

    const deeperFiles = allContents
        .filter(f => f.isDirectory())
        .map(d => vueFilesIn(`${dir}/${d.name}`))
        .reduce((acc, d) => acc.concat(d), []); // since arr.flat() doesn't exist in most versions of node, apparently

    return currFiles.concat(deeperFiles);
}

module.exports = {
    read,
    readAll,
    write,
    vueFilesIn
}