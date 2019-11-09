import j from 'jscodeshift';
import { object, objectProperty, isNode } from './JSUtils.js';

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
        this.j = j(text);
    }

    setData(key, value) {
        const data = this.findOrCreate('data', returnEmptyObject(), { method: true })

        const dataObject = data.find(j.ReturnStatement)
            .find(j.ObjectExpression)

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
    create(name, value, overwrites) {
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
        return this.j.toSource({ quote: 'single', lineTerminator: '\n', tabWidth: 4 })
            // Recast seperates multiline object properties by an extra newline on both sides
            // https://github.com/benjamn/recast/issues/242
            // the author did it for personal preference and, after years of complaints, has not made it alterable
            .replace(/}\n\n/mg, '')
            .replace(/\n\n(.+){/mg, '\n$1{');
    }
}