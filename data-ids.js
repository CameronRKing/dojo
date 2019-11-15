const fs = require('./filesystem');
const VueComponent = require('./ServerVueComponent');

async function addDataIds(dir) {
    const files = await fs.vueFilesIn(dir);
    files.forEach(async file => {
        try {
            let str = await fs.read(file);
            const cmp = new VueComponent(str);
            await cmp.ready();
            let id = cmp.getNextDataId();
            cmp.addAttr('data-palette', () => id++);
            const res = await fs.write([file, cmp.toString()]);
        } catch(e) {
            console.log('failed on ' + file);
        }
    });
}

// async function removeDataIds() {
//     const files = await fs.vueFilesIn('src');
//     files.forEach(async file => {
//         try {
//             const cmp = new VueComponent(await fs.read(file));
//             await cmp.ready();
//             cmp.removeAttr('data-palette');
//             fs.write(file, cmp.toString());
//         } catch(e) {
//             console.log('failed on ' + file);
//         }
//     });
// }

module.exports = {
    addDataIds,
    // removeDataIds
};