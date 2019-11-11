const io = require('socket.io')();
const fs = require('fs');
const posthtml = require('posthtml');

io.on('connection', (client) => {
    const posthtmlProcess = (filename, cb) => {
        const file = fs.readFileSync(filename, 'utf8');
        const newFile = posthtml().use(cb)
            .process(file, { sync: true })
            .html;
        fs.writeFileSync(filename, newFile);
    }

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
