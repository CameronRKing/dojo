<script>
import { getFieldNames, getFieldValue } from 'ast-types';
import VPrompts from '@/components/VPrompts';

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

function nodeAttrs(node) {
    return getFieldNames(node)
        .filter(field => field !== 'type' && !(Array.isArray(node[field]) || typeof node[field] == 'object'))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

function nodeChildren(node) {
    const attrs = Object.keys(nodeAttrs(node));
    return getFieldNames(node)
        .filter(field => field !== 'type' && !attrs.includes(field))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

export default {
    components: {
        VPrompts,
    },
    props: ['nodePath'],
    computed: {
        prompts() {
            return [];
        },
        nodeChain() {
            if (!this.nodePath) return [];
            return getNodeParentChain(this.nodePath);
        },
        nodeAttrs() {
            if (!this.nodePath) return {};
            return nodeAttrs(this.nodePath.value);
        },
        nodeChildren() {
            if (!this.nodePath) return {};
            return nodeChildren(this.nodePath.value);
        }
    },
}
</script>



<template>
<div class="flex-grow">
    <div>
        <span v-for="(link, idx) in nodeChain.reverse()">
            {{ link.type }}<span v-if="link.field">.{{ link.field }}</span>
            <span v-if="link.pos">[{{link.pos}}]</span>
            <span v-if="idx != nodeChain.length - 1">&nbsp;>&nbsp;</span>
        </span>
    </div>
    <div class="flex">
        <div class="flex-grow">
            <div class="font-bold text-sm tracking-wider uppercase text-center">attributes</div>
            <div v-if="Object.keys(nodeAttrs).length == 0" class="text-center">< no attributes ></div>
            <table>
                <tr v-for="(val, field) in nodeAttrs">
                    <td class="text-right font-bold">{{ field }}:</td>
                    <td class="text-left">{{ JSON.stringify(val) }}</td>
                </tr>
            </table>
        </div>

        <div class="flex-grow">
            <div class="font-bold text-sm tracking-wider uppercase text-center">children</div>
            <div v-if="Object.keys(nodeChildren).length == 0" class="text-center">< no attributes ></div>
            <table>
                <tr v-for="(val, field) in nodeChildren">
                    <td class="text-right font-bold">{{ field }}:</td>
                    <td class="text-left">{{ Array.isArray(val) ? JSON.stringify(val.map(v => v.type)) : v.type }}</td>
                </tr>
            </table>
        </div>
    </div>

    <div>
        <VPrompts v-bind="{ prompts }" />
    </div>
</div>
</template>