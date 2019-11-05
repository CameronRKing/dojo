const j = require('jscodeshift');


function object(obj) {
    return j.objectExpression(
        Object.keys(obj).map(key => objectProperty(key, obj[key]))
    )
}

function objectProperty(key, value) {
    return j.property('init', j.identifier(key), typeof value == 'object' ? object(value) : j.literal(value));
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

module.exports = class VueComponent {
    constructor(text) {
        this.j = j(text);
    }

    setData(key, value) {
        let data = this.j.find(j.ExportDefaultDeclaration)
            .find(j.Identifier, { name: 'data' })
            .closest(j.Property);

        if (!data.length) {
            const prop = j.property('init', j.identifier('data'), returnEmptyObject())
            prop.method = true;
            this.j.find(j.ExportDefaultDeclaration)
                .get()
                .value
                .declaration
                .properties
                .push(prop)
            data = j(prop);
        }

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

    toString() {
        return this.j.toSource({ quote: 'single', lineTerminator: '\n', tabWidth: 4 })
            // Recast seperates multiline object properties by an extra newline on both sides
            // https://github.com/benjamn/recast/issues/242
            // the author did it for personal preference and, after years of complaints, has not made it alterable
            .replace(/}\n\n/mg, '')
            .replace(/\n\n(.+){/mg, '\n$1{');
    }
}