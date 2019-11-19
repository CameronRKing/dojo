<script>
import j from 'jscodeshift';
import CodeMirror from '@/components/CodeMirror.vue';
import fs from '@/fs-client.js';
import VueComponent from '@/VueComponent.js';
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
    components: {
        CodeMirror,
    },
    data() {
        return {
            file: '',
            ast: null,
            nodePath: null,
        }
    },
    watch: {
        async file() {
            this.ast =  new VueComponent(this.file);
            await this.ast.ready();
            this.nodePath = this.ast.script.find(j.Program).get();
            window.nodePath = this.nodePath;
        }
    },
    computed: {
        nodeChain() {
            if (!this.nodePath) return [];
            return getNodeParentChain(this.nodePath);
        },
        nodeAttrs() {
            if (!this.nodePath) return {};
            const node = this.nodePath.value;
            const attrs = getFieldNames(node)
                .filter(field => field !== 'type' && !(Array.isArray(node[field]) || typeof node[field] == 'object'));
            return attrs.reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
        },
        nodeChildren() {
            if (!this.nodePath) return {};
            const node = this.nodePath.value;
            const attrs = Object.keys(this.nodeAttrs);
            const children = getFieldNames(node)
                .filter(field => !attrs.includes(field) && field !== 'type');
            return children.reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
        }
    },
    created() {
        fs.read('src/test/App.vue')
            .then(file => this.file = file);
    },
    methods: {

    }
}
</script>



<template>
<div class="flex h-full">
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
    </div>
    <CodeMirror class="flex-grow" v-model="file" />
</div>
</template>