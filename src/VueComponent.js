const j = require('jscodeshift');
const { object, objectProperty, isNode, toSource } = require('./JSUtils.js');

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

module.exports = class VueComponent {
    constructor(text) {
        this.j = j(text);
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
        return this.j.find(j.ExportDefaultDeclaration)
            .find(j.Identifier, { name })
            .closest(j.Property);
    }

    /**
     * Adds a new property to the export default object
     **/
    create(name, value, overwrites={}) {
        const prop = j.property('init', j.identifier(name), value)
        assocIn(prop, overwrites);

        this.j.find(j.ExportDefaultDeclaration)
            .get()
            .value
            .declaration
            .properties
            .push(prop);
        return j(prop);
    }

    toString() {
        return toSource(this.j);
    }
}