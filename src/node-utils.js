import { getFieldNames, getFieldValue } from 'ast-types';
import { assocIn } from '@/utils.js';

/**
 * Returns an array of the path from the given node to the root
 * Root is at the end of the array.
 **/
export function getNodeParentChain(node) {
    let nodeChain = [{ node, type: node.value.type }];
    let parent = node.parent;
    let child = node;
    while (parent) {
        nodeChain.push(getPositionInParent(child.value, parent.value));
        let newChild = parent;
        parent = parent.parent;
        child = newChild;
    }
    return nodeChain;
}

export function getPositionInParent(child, parent) {
    // if its an Array, we need the field name AND the position
    // otherwise, we just need the field name
    let pos;
    const field = getFieldNames(parent).find(name => {
        const val = getFieldValue(parent, name);
        if (Array.isArray(val)) {
            pos = val.indexOf(child);
            if (pos >= 0) return true;
            pos = undefined;
            return false;
        }
        return val == child;
    });
    return {
        field,
        pos,
        type: parent.type,
        node: parent,
    };
}

export function attemptToFind(startNode, nodePath) {
    const chain = getNodeParentChain(nodePath);
    // remove the first link, which is the nodePath itself
    chain.shift();
    let link, node = startNode;
    while (link = chain.pop()) {
        const { field, pos } = link;
        const args = pos === undefined ? [field] : [field, pos]

        let child = node.get(...args);

        if (!child) break;
        node = child;
    }
    return node;
}


export function nodeAttrs(node) {
    return getFieldNames(node)
        .filter(field => node[field] == null || !(Array.isArray(node[field]) || typeof node[field] == 'object'))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

export function nodeChildren(node) {
    const attrs = Object.keys(nodeAttrs(node));
    return getFieldNames(node)
        .filter(field => !attrs.includes(field))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

export function getDefaultExport(coll) {
    const objPath = coll.find(j.ExportDefaultDeclaration)
        .get()
        .get('declaration');
    return j(objPath);  
}

export function setObjProp(objColl, name, val) {
    let prop;
    if (objHasProp(objColl, name)) {
        prop = findObjProp(objColl, name);
        prop.get().value.value = parseJSValue(val);
    } else {
        prop = objProp(key, val);
        objColl.get().value.properties.push(prop);
    }
    return prop;
}

export function objHasProp(objColl, name) {
    return Boolean(objColl.find(j.Identifier, { name }).length);
}

export function findObjProp(objColl, name) {
    return objColl.find(j.Identifier, { name }).closest(j.Property);
}

export function parseJSValue(value) {
    let val;
    if (isNode(value)) {
        val = value.get().value;
    } else {
        switch (typeof value) {
            case 'object':
                val = object(value);
                break;
            case 'function':
                val = parseFn(value);
                break;
            default:
                val = j.literal(value);
        }
    }
    return val;
}

export function parseFn(fn) {
    return j(fn.toString()).find(j.FunctionExpression).get()
}

export function objProp(key, value, overrides={}) {
    const prop = j.property('init', j.identifier(key), parseJSValue(value));
    assocIn(prop, overrides);
    return prop;
}

export function object(obj={}) {
    return j.objectExpression(
        Object.keys(obj).map(key => objProp(key, obj[key]))
    )
}

// is that really the best way to check?
export function isNode(value) {
    return typeof value.get == 'function';
}

export function returnEmptyObject() {
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

export function contains(point) {
    return (node) => node.start <= point && point <= node.end;
}

// this needs to be a lot more flexible  
export function toSource(jSrc) {
    return jSrc.toSource({ quote: 'single', lineTerminator: '\n', tabWidth: 4, arrowParensAlways: true })
        // Recast seperates multiline object properties by an extra newline on both sides
        // https://github.com/benjamn/recast/issues/242
        // the author did it for personal preference and, after years of complaints, has not made it alterable
        .replace(/,\n\n/mg, ',\n')
        .replace(/{\n\n/mg, '{\n')
}
