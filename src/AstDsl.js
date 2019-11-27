const { visit: recastVisit } = require('ast-types');
const typeShortcuts = require('./type-shortcuts.json')
const j = require('jscodeshift');
const matchNode = require('jscodeshift/dist/matchNode.js');
const Collection = require('jscodeshift/dist/Collection.js');

function expand(type) {
    if (j[type]) return type;
    if (typeShortcuts[type]) return typeShortcuts[type];
    throw new Error(`${type} not found in ast-types or type-shortcuts.`);
}

function hydratePath(path, val) {
    return path.split('.').reverse().reduce((acc, val) => ({ [val]: acc} ), val);
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
});

class AstDsl {
    constructor(ast) {
        this.ast = ast;
    }

    find(str, filters) {
        const elements = str.split(' ');
        let node = this.ast;
        let shouldBreak = false;
        let lastFound = '< none >';
        let directDescendant = false;
        let attr = '';
        // this function is an awful mess of spaghetti code
        elements.forEach(el => {
            if (shouldBreak) return;
            // check for a direct descendant indicator
            if (el == '>') {
                directDescendant = true;
                return;
            }

            // check for a filter based on the node's attributes
            let filter;
            if (el.includes('[')) {
                filter = el.split('[')[1].replace(']', '');
                el = el.split('[')[0];
                const [attr, val] = filter.split('=');
                if (val)
                    filter = hydratePath(attr, val);
                else
                    filter = filters[attr];
            }

            let newNode;
            if (attr) {
                attr = '';
                if (directDescendant) {
                    directDescendant = false;
                    newNode = node.filter(path =>
                        j[expand(el)].check(path.value) && (filter ? matchNode(filter, path.value) : true)
                    );
                    if (!newNode.length) {
                        shouldBreak = true;
                    }
                    lastFound = el;
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
                newNode = newNode.map(path => path.get(attr));
            }

            if (!newNode.length) {
                shouldBreak = true;
            }
            lastFound = el;
            node = newNode;
        });
        return node;
    }
}

module.exports = AstDsl

function test() {
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
}

test();
