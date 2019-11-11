const io = require('socket.io')();
const fs = require('fs');
const posthtml = require('posthtml');
const j = require('jscodeshift');
const { parseComponent } = require('vue-sfc-parser');
const VueComponent = require('./src/VueComponent');

io.on('connection', (client) => {
    const posthtmlProcess = (filename, cb) => {
        fs.readFile(filename, 'utf8', (err, file) => {
            posthtml().use(cb).process(file)
                .then(({ html }) => fs.writeFile(filename, html, () => {}))
        });
    }

    const jscodeshiftProcess = (filename, cb) => {
        fs.readFile(filename, 'utf8', (err, file) => {
            const blocks = parseComponent(file);
            if (!blocks.script) return;
            const cmp = new VueComponent(blocks.script.content);

            cb(cmp);

            const newSrc = file.replace(
                blocks.script.content,
                cmp.toString()
            );
            fs.writeFile(filename, newSrc, () => {});
        });
    }

    client.on('addPathToAllComponents', () => {
        vueFilesIn('src').forEach(path => {
            jscodeshiftProcess(path, (cmp) => {
                cmp.findOrCreate('path', j.identifier('__filename'))
            });
        })
    })

    client.on('addPathToComponent', (path) => {
        jscodeshiftProcess(path, (cmp) => {
            cmp.findOrCreate('path', j.identifier('__filename'))
        })
    })

    client.on('addPaletteIds', (filename) => {
        posthtmlProcess(filename, (tree) => {
            let id = 0;
            addAttr(tree, 'data-palette', () => id++)
        })
    });

    client.on('removePaletteIds', (filename) => {
        posthtmlProcess(filename, (tree) => {
            removeAttr(tree, 'data-palette');
        });
    }); 

    client.on('setClass', ([filename, id, classStr]) => {
        posthtmlProcess(filename, (tree) => {
            findByPaletteId(tree, id, (node) => {
                console.log(node);
                if (!node.attrs) node.attrs = {};
                node.attrs.class = classStr;
                return node;
            })
        })
    });
});

io.listen(3000);


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

function addDataPaletteIds(tree) {
    let id = 0;
    addAttr(tree, 'data-palette', () => id++);
}

/**
 * Adds an attribute to all non-script, non-template tags
 * Gets attribute value from a callback that accepts the node in question
 **/
function addAttr(tree, attr, getVal) {
    const add = (node) => {
        // this is a weird hack for now. I'm essentially .vue files as .html files
        // it'd be better if I could modify only the contents of the top-level template tag
        if (['script', 'template', 'style'].includes(node.tag)) return node;

        if (!node.attrs) node.attrs = {};
        node.attrs[attr] = getVal(node);
        return node;
    }

    tree.match({ attrs: undefined }, add);
    tree.match({ attrs: { [attr]: undefined } }, add);
}

function findByPaletteId(tree, id, cb) {
    tree.match({ attrs: { 'data-palette': id } }, cb);
}

/**
 * What it says on the box
 **/
function removeAttr(tree, attr) {
    tree.match({ attrs: { [attr]: /\.*/ } }, (node) => {
        node.attrs[attr] = undefined;
        return node;
    });
}
