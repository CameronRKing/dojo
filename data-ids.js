const fs = require('./filesystem');
const VueComponent = require('./ServerVueComponent');

async function forVueCmpInDir(dir, cb) {
    (await fs.vueFilesIn(dir))
        .forEach(async file => {
            try {
                let str = await fs.read(file);
                const cmp = new VueComponent(str);
                await cmp.ready();
                cb(cmp);
                await fs.write([file, cmp.toString()]);
            } catch(e) {
                console.log('failed on ' + file);
            }
        });
    return Promise.resolve();
}

async function addDataIdsTo(file) {
    console.log(file);
    const str = await fs.read(file);
    const cmp = new VueComponent(str);
    await cmp.ready();
    let id = cmp.getNextDataId();
    cmp.addAttr('data-palette', () => id++);
    return fs.write([file, cmp.toString()]);
}

function addDataIds(dir) {
    return forVueCmpInDir(dir, cmp => {
        let id = cmp.getNextDataId();
        cmp.addAttr('data-palette', () => id++);
    });
}

// updating is actually the same as adding, for now
function updateDataIds(dir) {
    return addDataIds(dir);
}

function removeDataIds(dir) {
    return forVueCmpInDir(dir, cmp => {
        cmp.removeAttr('data-palette');
    });
}



module.exports = {
    addDataIds,
    updateDataIds,
    removeDataIds,
    addDataIdsTo,
    // a little cleanup hack for now
    disconnect: () => removeDataIds('src/test'),
};