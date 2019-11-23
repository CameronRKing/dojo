import { getFieldNames, getFieldValue } from 'ast-types';

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