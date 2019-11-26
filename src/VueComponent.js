const j = require('jscodeshift');
const posthtml = require('posthtml');
const { parseComponent } = require('vue-sfc-parser');
const { assocIn } = require('./utils.js');
const {
    toSource, setObjProp,
    findObjProp, getDefaultExport,
    objProp, returnEmptyObject,
    object, parse
} = require('./node-utils.js');
const { render } = require('@/htmlrender.js');

export default class VueComponent {
    constructor(text) {
        this.isDone = new Promise(resolve => {
            // push HTML processing into a separate component
            // then the HTML-specific methods can follow it
            posthtml().process(text, { recognizeSelfClosing: true, closingSingleTag: 'slash', render }).then(results => {
                this.results = results;
                this.tree = results.tree;
                this.script = undefined;
                results.tree.match({ tag: 'script' }, node => {
                    this.scriptNode = node;
                    // node.content may be an array of strings instead of one string
                    // since the JS code is represented as a JS string, slashes need to be double-escaped
                    // else you get "unterminated string constant" errors because
                    // the slashes get used up by the parser
                    let content = node.content.join('').replace(/\\/g, '\\\\');
                    this.script = j(content);
                    return node;
                });
                if (!this.script) this.script = j('');
                resolve()
            });
        });
    }

    addPath() {
        this.findOrCreate('path', j.identifier('__filename'));
    }

    importComponent(path) {
        const cmpName = path.split('/').slice(-1)[0].split('.')[0];
        // add import statement
        const statement = parse(`import ${cmpName} from '${path}';`);
        this.addToTop(statement);

        // register inside component
        const components = this.findOrCreate('components', object());
        const cmpProp = objProp(cmpName, j.identifier(cmpName), { shorthand: true });
        components.get().value.value.properties.push(cmpProp);
    }

    addToTop(statement) {
        this.script.find(j.Program).get().value.body.unshift(statement);
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

    data() {
        return {
            length: () => {
                const data = this.find('data');
                if (!data.length) return 0;
                const obj = this.dataObj(data);
                return this.length(obj);
            },
            set: (key, val) => this.setData(key, val),
            get: (key) => this.getData(key),
        }
    }

    length(objColl) {
        if (objColl.length == 0) return 0;
        return objColl.get().value.properties.length;
    }

    setData(key, value) {
        const data = this.findOrCreate('data', returnEmptyObject(), { method: true });
        const obj = this.dataObj(data);

        return setObjProp(obj, key, value);
    }

    getData(key) {
        const data = this.find('data');
        if (!data.length) return null;
        const obj = this.dataObj(data);
        return findObjProp(obj, key);
    }

    dataObj(dataColl) {
        return dataColl.find(j.ReturnStatement).find(j.ObjectExpression);
    }

    setMethod(name, fn) {
        const methods = this.findOrCreate('methods', object());

        const prop = objProp(name, parseFn(fn), { method: true });
        methods.get()
            .value
            .value
            .properties
            .push(prop);

        return this;
    }

    // find and create are attached to the export default declaration
    // and they deal with object properties
    // there's gotta be a way to make them more general
    findOrCreate(name, value, overrides={}) {
        let node = this.find(name);

        if (!node.length) {
            const prop = objProp(name, value, overrides);
            getDefaultExport(this.script).get().value.properties.push(prop);
            node = j(prop);
        }

        return node;
    }

    find(name) {
        return findObjProp(getDefaultExport(this.script), name);
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
            if (!classStr) node.attrs.class = undefined;
            return node;
        });
    }

    toString() {
        this.tree.match({ tag: 'script' }, node => {
            node.content = [toSource(this.script)];
            return node;
        });
        return this.results.html;
    }
}