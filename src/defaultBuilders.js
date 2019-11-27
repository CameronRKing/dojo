const { builders: b, namedTypes: n } = require('ast-types');
module.exports = {
    ObjectExpression() {
        return b.objectExpression([]);
    },
    Property({ key, value }={}) {
        if (key && key.name) key = b.identifier(key.name);
        else key = b.identifier('changeme');

        if (!value) value = b.literal('null');
        const prop = b.property('init', key, value);
        if (n.Identifier.check(key) && n.Identifier.check(value)
                && key.name == value.name) {
            prop.shorthand = true;
        }
        if (n.FunctionExpression.check(value)) {
            prop.method = true;
        }
        return prop;
    },
    ReturnStatement(value) {
        if (!value) value = b.literal('null');
        return b.returnStatement(value);
    },
    BlockStatement(body=[]) {
        if (body && !Array.isArray(body)) body = [body];
        return b.blockStatement(body);
    },
    FunctionExpression(body) {
        if (!body) body = b.blockStatement([]);
        return b.functionExpression(null, [], body);
    }
}