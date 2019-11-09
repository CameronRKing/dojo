import j from 'jscodeshift';

function contains(point) {
    return (node) => node.start <= point && point <= node.end;
}
  
export function toSource(jSrc) {
    return jSrc.toSource({ quote: 'single', lineTerminator: '\n', tabWidth: 4, arrowParensAlways: true })
        // Recast seperates multiline object properties by an extra newline on both sides
        // https://github.com/benjamn/recast/issues/242
        // the author did it for personal preference and, after years of complaints, has not made it alterable
        .replace(/}\n\n/mg, '')
        .replace(/\n\n(.+){/mg, '\n$1{')
}

export function object(obj={}) {
    return j.objectExpression(
        Object.keys(obj).map(key => objectProperty(key, obj[key]))
    )
}

export function isNode(value) {
    return typeof value.get == 'function';
}

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

export function objectProperty(key, value) {
    return j.property('init', j.identifier(key), parseValue(value));
}

class AnonymousFunction {
    constructor(node) {
        this.fn = node;
    }

    static closestToPoint(jSrc, idx) {
        const fns = jSrc.find(j.ArrowFunctionExpression, contains(idx));
        if (!fns.length) {
            throw new Error('Did not find any ArrowFunctionExpressions around the index ' + idx);
        }
        return new AnonymousFunction(fns.at(fns.length - 1).get().value);
    }

    addArg(argName) {
        this.fn.params.push(j.identifier(argName));
    }

    removeArg(argIdx) {
        this.fn.params.splice(argIdx, 1);
    }

    setDefaultArg(argIdx, defaultVal) {
        // if there's already a default for this arg, update it
        if (this.fn.params[argIdx].type == 'AssignmentPattern') {
            this.fn.params[argIdx].right = parseValue(defaultVal);
            return;
        }
        // if there is no default, set it
        this.fn.params.splice(argIdx, 1, j.assignmentPattern(
            this.fn.params[argIdx],
            parseValue(defaultVal),
        ))
    }

    addBody() {
        if (this.fn.body.type == 'BlockStatement')
            return;
        
        this.fn.body = j.blockStatement([
            j.returnStatement(this.fn.body)
        ]);
    }

    returnObject() {
        if (this.fn.body.type == 'ObjectExpression')
            return;

        const ret = j(this.fn.body).find(j.ReturnStatement);
        if (ret.length) {
            const retVal = ret.get().value.argument;
            if (retVal.type == 'ObjectExpression') {
                this.fn.body = retVal;
            } else {
                this.fn.body = j.objectExpression([j.property('init', 'data', retVal)]);
            }
        } else {
            this.fn.body = j.objectExpression([])
        }
    }
}

const toFnAt = (src, idx, cb) => {
    const jSrc = j(src);
    const fn = AnonymousFunction.closestToPoint(jSrc, idx);
    cb(fn)
    return toSource(jSrc);
}
export default {

    anonWithBody(src, idx) {
        return toFnAt(src, idx, (fn) => fn.addBody());
    },

    // add parenthesis/braces to anonymous function
    anonReturnObject(src, idx) {
        return toFnAt(src, idx, (fn) => fn.returnObject());
    },

    fnAddArg(src, idx, arg) {
        return toFnAt(src, idx, (fn) => fn.addArg(arg));
    },

    fnRemoveArg(src, idx, argIdx) {
        return toFnAt(src, idx, (fn) => fn.removeArg(argIdx));
    },

    fnSetDefault(src, idx, argIdx, defaultVal) {
        return toFnAt(src, idx, (fn) => fn.setDefaultArg(argIdx, defaultVal));
    }

    // deconstructArg(src, idx, argIdx, contents) {

    // }

    // reconstructArg(src, idx, argIdx) {

    // }

    // extractFn(src, start, end) {

    // }
    // add argument
    // deconstruct argument
    // reconstruct argument
    // extract
}