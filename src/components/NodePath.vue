<script>
import { getFieldNames, getFieldValue } from 'ast-types';

function getNodeParentChain(node) {
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

function getPositionInParent(child, parent) {
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

export default {
    props: ['nodePath'],
    computed: {
        nodeChain() {
            if (!this.nodePath) return [];
            return getNodeParentChain(this.nodePath);
        }
    }    
}

</script>



<template>
<div>
    <span v-for="(link, idx) in nodeChain.reverse()">
        {{ link.type }}<span v-if="link.field">.{{ link.field }}</span>
        <span v-if="link.pos">[{{link.pos}}]</span>
        <span v-if="idx != nodeChain.length - 1">&nbsp;>&nbsp;</span>
    </span>
</div> 
</template>