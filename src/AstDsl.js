const { visit: recastVisit } = require('ast-types');
const typeShortcuts = require('./type-shortcuts.json')
const j = require('jscodeshift');
// be careful to use jscodeshift/src instead of j/dist
// I ran into an wonky issue with method registration
// dist/Collection didn't recognize registered methods,
// because jscodeshift does everything through the src directory
// so what is /dist for?
const matchNode = require('jscodeshift/src/matchNode.js');
const Collection = require('jscodeshift/src/Collection.js');
const defaultBuilders = require('./defaultBuilders.js');

function expand(type) {
    if (typeShortcuts[type]) return typeShortcuts[type];
    if (j[type]) return type;
    throw new Error(`${type} not found in ast-types or type-shortcuts.`);
}

function hydratePath(path, val) {
    return path.split('.').reverse().reduce((acc, val) => ({ [val]: acc} ), val);
}

function getFilter(el, filters) {
    let remains, filterStr, filter, newEl = el;
    if (el.includes('[')) {
        [newEl, filterStr] = el.split('[')
        // ready for a weird bug? if I remove this if statement, filterStr is suddenly undefined
        // checking for the bug somehow fixes it
        // WHAT?
        if (!filterStr) console.log('no filter string!');
        [filterStr, remains] = filterStr.split(']');
        const [attr, val] = filterStr.split('=');
        if (val)
            filter = hydratePath(attr, val);
        else
            filter = filters[attr];
    }
    return [filter, newEl + (remains ? remains : '')];
}

/**
 * Given an element clause and the result of building the clause after it,
 * Create a new AST node as best we can by deducing things from the context
 **/
function defaultBuilder(el, arg) {
    let builderArg = {};
    let type = el;
    // we can deduce a values from the filter clause
    if (el.includes('[')) {
        let filter;
        [filter, el] = getFilter(el, {});
        type = el;
        if (typeof filter == 'object')
            Object.assign(builderArg, filter);
    }
    // if the element includes a direct reference to an attr, we know where the arg belongs
    if (el.includes('.')) {
        let attr;
        [type, attr] = el.split('.');
        builderArg[attr] = arg;
    }
    if (!Object.keys(builderArg).length) builderArg = arg;
    return defaultBuilders[expand(type)](builderArg);
}

function edit(node, newNode) {
    if (node.get().value.type == 'ObjectExpression') // there's only one thing to do to an object: push a property
        node.forEach(path => path.value.properties.push(newNode));
}

j.registerMethods({
    // exactly the same as find, but there's a check in the visitor
    //that returns false if the visited node's parent isn't the node in question
    // pretty sure I could implement it more directly using eachField(),
    // but that seems like unnecessary work at the moment
    findDirectDescendants(type, filter) {
        const paths = [];
        function visit(path) {
            if (!filter || matchNode(path.value, filter)) {
                paths.push(path);
            }
            this.traverse(path);
        }

        const visitorMethodName = 'visit' + type;
        const visitor = {};
        this.__paths.forEach(function(p, i) {
            const self = this;
            visitor[visitorMethodName] = function(path) {
                if (path.parent != p) return false;
                if (self.__paths[i] === path) {
                    this.traverse(path);
                } else {
                    return visit.call(this, path);
                }
            };
            recastVisit(p, visitor);
        }, this);

        return Collection.fromPaths(paths, this, type);
    },
}, j.Node);

class AstDsl {
    constructor(ast) {
        this.ast = ast;
    }

    // may god have mercy on my soul
    // for the sins I have worked here
    find(str, filters={}, { lastFound=false }={}) {
        const elements = str.split(' ');
        let node = this.ast;
        let shouldBreak = false;
        let lastIdx = null;
        let directDescendant = false;
        let attr = '';
        // this function is an awful mess of spaghetti code
        elements.forEach((el, idx) => {
            if (shouldBreak) return;
            // check for a direct descendant indicator
            if (el == '>') {
                directDescendant = true;
                return;
            }

            let filter;
            [filter, el] = getFilter(el, filters);

            // if looking for a direct descendant in an attribute,
            // filter the attributes by the given type
            // if we're not looking for a direct descendant, find will work fine
            let newNode;
            if (attr) {
                attr = '';
                if (directDescendant) {
                    directDescendant = false;

                    newNode = this.filter(node, el, filter);

                    if (!newNode.length) {
                        shouldBreak = true;
                        return;
                    }

                    lastIdx = idx;
                    node = newNode;

                    return;
                }
            }

            // check for indicating a specific attr to look down
            if (el.includes('.')) {
                attr = el.split('.')[1];
                el = el.split('.')[0];
            }

            const type = j[expand(el)];
            if (directDescendant) {
                directDescendant = false;
                newNode = node.findDirectDescendants(type, filter);
            } else {
                newNode = node.find(type, filter);
            }

            if (attr) {
                // can't reset attr yet because we don't yet know if
                // there's further logic to filter these nodes thorugh
                newNode = newNode.map(path => path.get(attr));
            }

            if (!newNode.length) {
                lastIdx = idx;
                shouldBreak = true;
                return;
            }
            node = newNode;
        });
        if (shouldBreak && !lastFound) return null;
        if (shouldBreak && lastFound) return [node, elements.slice(lastIdx).join(' ')];
        return node;
    }

    filter(node, el, filter) {
        return node.filter(path =>
            j[expand(el)].check(path.value) && (filter ? matchNode(filter, path.value) : true)
        );
    }

    set(str, filters) {
        let [node, pathRemaining] = this.find(str, filters, { lastFound: true });
        if (!pathRemaining) return node;
        const newNode = pathRemaining.replace(/> /g, '').replace('  ', ' ').split(' ').reverse()
            .reduce((acc, el) => {
                return defaultBuilder(el, acc);
            }, null);
        // I've got almost all of it
        // it's this last bit that I don't quite know how to do
        // instead of building a whole new node, I want to edit it
        edit(node, newNode);
        return node;
    }
}

module.exports = AstDsl

function testFind() {
    const $ = new AstDsl(j('const woo = "woo woo"; export default { data() { return { foo: "bar", baz: "dont panic", woo }; } }'));
    // indirect searching
    let node = $.find('ExpDef ObjExp FnExp');
    console.log(node.length == 1);

    // direct descendants
    node = $.find('ExpDef ObjExp');
    console.log(node.length == 2);
    node = $.find('ExpDef > ObjExp');
    console.log(node.length == 1);

    // simple attribute filter
    node = $.find('FnExp Prop');
    console.log(node.length == 3);
    node = $.find('FnExp Prop[key.name=foo]')
    console.log(node.length == 1);

    // custom filters
    node = $.find('Prop[hasFnExp]', { hasFnExp: (node) => node.value.type == 'FunctionExpression' });
    console.log(node.length == 1);

    // searching only specific attributes of the parent
    node = $.find('Prop > Id');
    console.log(node.length == 5);
    node = $.find('Prop.value > Id');
    console.log(node.length == 1);

    node = $.find('ExpDef > ObjExp > Prop > FnExp');
    console.log(node.length == 1);
}

function testSet() {
    const $ = new AstDsl(j('export default {}'));
    let node = $.set('ExpDef > ObjExp > Prop[key.name=data].value > FnExp > BlockSt > Return > ObjExp');
    console.log(node.toSource().replace(/\r\n/g, '\n') ==
`export default {
  data() {
    return {};
  }
};`);
}

// testFind();
testSet();
