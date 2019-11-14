const j = require('jscodeshift');

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

// I don't like that this class deals only with arrow functions (and is poorly named!)
// the argument logic applies equally to normal functions
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

    // the arg param abstraction is inconsistent. removeArg && setDefaultArg should accept names.
    // if they also want to accept indices, that's on them. Might not be necessary.
    // I have no idea what's necessary. This stuff was built in a vacuum.
    // I won't know what I want till it's part of my workflow.
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


// this controller logic needs to be split out
const routes = {
    anonWithBody: (fn) => fn.addBody(),
    anonReturnObject: (fn) => fn.returnObject(),
    fnAddArg: (fn, arg) => fn.addArg(arg),
    fnRemoveArg: (fn, argIdx) => fn.removeArg(argIdx),
    fnSetDefault: (fn, argIdx, defaultVal) => fn.setDefaultArg(argIdx, defaultVal),
    // remove default (should be setDefault with undefined)
    // deconstruct argument
    // reconstruct argument
    // extract
    // inline
}

// wrap each call in routes with input/output logic
// => turning src+idx into a function
// <= returning updated source code as a string
const wrappedRoutes = mapWithKeys(routes, (key, handler) =>
    [key, (src, idx, ...args) => toFnAt(src, idx, (fn) => handler(fn, ...args))]
);

function mapWithKeys(obj, cb) {
    return Object.keys(obj).reduce((acc, key) => {
        const [attr, val] = cb(key, obj[key]);
        return {
            ...acc,
            [attr]: val,
        };
    }, {});
}

// with a function that accepts src/idx,
// hands over the function found there and any args to the handler,
// and returns the updated AST printed source
const toFnAt = (src, idx, cb) => {
    const jSrc = j(src);
    const fn = AnonymousFunction.closestToPoint(jSrc, idx);
    cb(fn)
    return toSource(jSrc);
}

Object.keys()
function wrappedRoutes;
