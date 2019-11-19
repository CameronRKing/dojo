<script>
import { getFieldNames, getFieldValue } from 'ast-types';
import { mapInvert, showType } from '@/utils.js';

function nodeAttrs(node) {
    return getFieldNames(node)
        .filter(field => node[field] == null || !(Array.isArray(node[field]) || typeof node[field] == 'object'))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

function nodeChildren(node) {
    const attrs = Object.keys(nodeAttrs(node));
    return getFieldNames(node)
        .filter(field => !attrs.includes(field))
        .reduce((acc, field) => ({ ...acc, [field]: node[field] }), {});
}

export default {
    props: ['node'],
    data() {
        return {
            toPreview: null,
        };
    },
    watch: {
        toPreview() {
            if (!this.toPreview) return;
            this.$emit('preview', this.toPreview);
        },
        node: {
            immediate: true,
            handler() {
                this.setDefaultPreview();
            }
        }
    },
    computed: {
        nodeAttrs() {
            if (!this.node) return {};
            return nodeAttrs(this.node);
        },
        nodeChildren() {
            if (!this.node) return {};
            return nodeChildren(this.node);
        },
        childToShortcut() {
            if (!this.node) return {};
            
        },
        shortcutToChild() {
            if (!this.node) return {};
            return mapInvert(this.childToShortcut);
        },
    },
    methods: {
        showType,
        setDefaultPreview() {
            const fields = Object.keys(this.nodeChildren);
            if (fields.length == 0) this.toPreview = null;
            else this.toPreview = fields[0];
        },
        selectPreviewDown() {
            const fields = Object.keys(this.nodeChildren);
            if (fields.length == 0) return;
            if (!this.toPreview) {
                this.toPreview = fields[0];
                return;
            }
            const newIdx = fields.indexOf(this.toPreview) + 1;
            if (newIdx > fields.length - 1) return;
            this.toPreview = fields[newIdx];
        },
        selectPreviewUp() {
            const fields = Object.keys(this.nodeChildren);
            if (fields.length == 0) return;
            if (!this.toPreview) {
                this.toPreview = fields[0];
                return;
            }
            const newIdx = fields.indexOf(this.toPreview) - 1;
            if (newIdx < 0) return;
            this.toPreview = fields[newIdx];
        },
        childClass(field) {
            return {
                'bg-gray-200': field == this.toPreview
            }
        }
    }
}
</script>



<template>
<div>
    <div class="flex">
        <div class="flex-grow">
            <div class="header">attributes</div>
            <table>
                <tr v-for="(val, field) in nodeAttrs">
                    <td class="text-left font-bold">{{ field }}:</td>
                    <td class="text-left">{{ JSON.stringify(val) }}</td>
                </tr>
            </table>
        </div>

        <div class="flex-grow">
            <div class="header">children</div>
            <div v-if="Object.keys(nodeChildren).length == 0" class="text-center">< no children ></div>
            <table>
                <tr v-for="(val, field) in nodeChildren" @click="toPreview = field" :class="childClass(field)">
                    <td class="text-left font-bold">{{ field }}:</td>
                    <td class="text-left">{{ Array.isArray(val) ? JSON.stringify(val.map(v => showType(v.type))) : showType(val.type) }}</td>
                </tr>
            </table>
        </div>
    </div>
</div>
</template>