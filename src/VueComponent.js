const j = require('jscodeshift')

function objectProperty(key, value) {
    return j.property('init', j.identifier(key), j.identifier(value));
}

module.exports = class VueComponent {
    constructor(text) {
        this.j = j(text);
    }

    addData(key, value) {
        const val = this.j.find(j.Identifier, { name: 'data' })
            .closest(j.Property)
            .find(j.ReturnStatement)
            .find(j.ObjectExpression)
            .get()
            .value
            .properties
            .push(objectProperty(key, value))
    }

    toString() {
        return this.j.toSource();
    }
}