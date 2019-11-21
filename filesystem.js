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

function write([filename, contents]) {
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
    return filesIn({ start: dir, file: f => f.name.endsWith('.vue') });
}

/**
 * Returns the paths of all files not in .git && node_modules
 * relative to the source directory of the node server
 **/
function srcFiles() {
    return filesIn({ directory: d => !['.git', 'node_modules'].includes(d.name) });
}

/**
 * Recursively finds all files that pass a truth test
 * Looks only in directories that pass a truth test
 * Finds all files in all directories by default
 * Starts looking in the server runtime directory by default
 **/
function filesIn({ start='.', directory, file }={}) {
    const dirTest = directory ? directory : () => true;
    const fileTest = file ? file : () => true;

    const contents = fs.readdirSync(start, { withFileTypes: true });

    const files = contents
        .filter(f => !f.isDirectory() && fileTest(f))
        .map(f => `${start}/${f.name}`);

    const deeperFiles = contents
        .filter(f => f.isDirectory() && dirTest(f))
        .map(d => filesIn({ start: `${start}/${d.name}`, directory, file }))
        .reduce((acc, d) => acc.concat(d), []);

    return files.concat(deeperFiles).map(name => name.replace(/^.\//, ''));
}

module.exports = {
    read,
    readAll,
    write,
    vueFilesIn,
    srcFiles,
    filesIn,
}