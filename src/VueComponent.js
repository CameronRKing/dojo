const j = require('jscodeshift');
const posthtml = require('posthtml');
const { parseComponent } = require('vue-sfc-parser');

function contains(point) {
    return (node) => node.start <= point && point <= node.end;
}

// this needs to be a lot more flexible  
function toSource(jSrc) {
    return jSrc.toSource({ quote: 'single', lineTerminator: '\n', tabWidth: 4, arrowParensAlways: true })
        // Recast seperates multiline object properties by an extra newline on both sides
        // https://github.com/benjamn/recast/issues/242
        // the author did it for personal preference and, after years of complaints, has not made it alterable
        .replace(/,\n\n/mg, ',\n')
        .replace(/{\n\n/mg, '{\n')
}


function object(obj={}) {
    return j.objectExpression(
        Object.keys(obj).map(key => objectProperty(key, obj[key]))
    )
}

function objectProperty(key, value) {
    return j.property('init', j.identifier(key), parseValue(value));
}

// c'mon. surely I don't have to write my own parsing logic?
// there's gotta be a better way to turn a real-life JS value into its AST equivalent
function parseValue(value) {
    let val;
    if (isNode(value)) {
        val = value.get().value;
    } else {
        if (typeof value == 'object') {
            val = object(value);
        } else {
            val = j.literal(value);
        }

    }
    return val;
}

// is that really the best way to check?
function isNode(value) {
    return typeof value.get == 'function';
}

function functionSourceToAST(src) {
    return j('export default { tmp: function' + src + '}').find(j.FunctionExpression).get()
}

function returnEmptyObject() {
    return j.functionExpression(
        null,
        [], 
        j.blockStatement([
            j.returnStatement(
                j.objectExpression([])
            )
        ])
    );
}

function assocIn(modified, toAdd) {
    return Object.keys(toAdd).forEach(key => {
        modified[key] = toAdd[key];
    });
}
export default class VueComponent {
    constructor(text) {
        this.isDone = new Promise(resolve => {
            posthtml().process(text).then(results => {
                this.results = results;
                this.tree = results.tree;
                this.script = undefined;
                results.tree.match({ tag: 'script' }, node => {
                    this.scriptNode = node;
                    this.script = j(node.content[0]);
                    return node;
                });
                resolve()
            });
        });
    }

    ready() {
        return this.isDone;
    }

    ping() {
        console.log(this, this.script)
    }

    pings() {
        console.log(toSource(this.script));
    }

    setData(key, value) {
        const data = this.findOrCreate('data', returnEmptyObject(), { method: true })

        const dataObject = data.find(j.ReturnStatement)
            .find(j.ObjectExpression)

        // I'm 100% positive this logic can be compressed and reused, but I can't see it yet
        let exists = dataObject.find(j.Identifier, { name: key });
        if (exists.length) {
            exists.closest(j.Property)
                .get()
                .value
                .value = typeof value == 'object' ? object(value) : j.literal(value);
        } else {
            dataObject.get()
                .value
                .properties
                .push(objectProperty(key, value))
        }
        return this;
    }

    setMethod(name, fnSrc) {
        const methods = this.findOrCreate('methods', object());

        const prop = objectProperty(name, functionSourceToAST(fnSrc));
        prop.method = true;
        methods.get()
            .value
            .value
            .properties
            .push(prop);

        return this;
    }

    addComponent(name, path) {

    }

    removeComponent(name) {

    }

    // find and create are attached to the export default declaration
    // and they deal with object properties
    // there's gotta be a way to make them more general
    findOrCreate(name, value, overwrites) {
        let node = this.find(name);

        if (!node.length) {
            node = this.create(name, value, overwrites);
        }

        return node;
    }

    /**
     * Looks for a property with the given name in the export default object
     **/
    find(name) {
        return this.script.find(j.ExportDefaultDeclaration)
            .find(j.Identifier, { name })
            .closest(j.Property);
    }

    /**
     * Adds a new property to the export default object
     **/
    create(name, value, overwrites={}) {
        const prop = j.property('init', j.identifier(name), value)
        assocIn(prop, overwrites);

        this.script.find(j.ExportDefaultDeclaration)
            .get()
            .value
            .declaration
            .properties
            .push(prop);
        return j(prop);
    }

    /**
     * Adds an attribute to all non-script, non-template tags
     * Ideally should accept a filter, where the default is non-script/template/style
     * Gets attribute value from a callback that accepts the node in question
     **/
    addAttr(attr, getVal) {
        const add = (node) => {
            // this is a weird hack for now. I'm essentially .vue files as .html files
            // it'd be better if I could modify only the contents of the top-level template tag
            if (['script', 'template', 'style'].includes(node.tag)) return node;

            if (!node.attrs) node.attrs = {};
            node.attrs[attr] = getVal(node);
            return node;
        }

        this.tree.match({ attrs: undefined }, add);
        this.tree.match({ attrs: { [attr]: undefined } }, add);
    }

    findByPaletteId(id, cb) {
        this.tree.match({ attrs: { 'data-palette': id } }, cb);
    }

    getNextDataId() {
        let nodes = [];
        this.tree.match({ attrs: { 'data-palette': /.*/ } }, node => {
            nodes.push(node);
            return node;
        });
        const ids = nodes.map(n => Number(n.attrs['data-palette']));

        if (!ids.length) return 0;

        return Math.max.apply(null, ids) + 1;
    }

    /**
     * What it says on the box; idealy should come with some sort of filter
     **/
    removeAttr(attr) {
        // I have no idea why, but using match instead of walk didn't work
        // match would miss nodes!
        this.tree.walk((node) => {
            if (node.attrs && node.attrs[attr])
                node.attrs[attr] = undefined;
            return node;
        });
    }

    setClass(id, classStr) {
        this.findByPaletteId(id, (node) => {
            if (!node.attrs) node.attrs = {};
            node.attrs.class = classStr;
            return node;
        })
    }

    addPath() {
        this.findOrCreate('path', j.identifier('__filename'));
    }

    toString() {
        this.tree.match({ tag: 'script' }, node => {
            node.content = [toSource(this.script)];
            return node;
        });
        return this.results.html;
    }
}