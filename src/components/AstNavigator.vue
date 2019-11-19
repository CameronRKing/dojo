<script>
import j from 'jscodeshift';
import Mousetrap from 'mousetrap';
import NodePath from '@/components/NodePath';
import NodePane from '@/components/NodePane';
import VPrompts from '@/components/VPrompts';
import { pairs } from '@/utils.js';

export default {
    components: {
        NodePath,
        NodePane,
        VPrompts,
    },
    props: ['ast'],
    data() {
        return {
            nodePath: null,
            toPreview: null,
            previewPos: 0,
            prompts: [
                ['tab', 'select parent'],
                ['j', 'move child highlight down'],
                ['k', 'move child highlight up'],
                ['enter', 'select highlighted child'],
                ['shift+j', '++childArrayIdx'],
                ['shift+k', '--childArrayIdx'],
            ],
            bindings: {
                tab(e) { e.preventDefault(); this.nodePath = this.nodePath.parent; },
                j() { this.$refs.nodePane.selectPreviewDown(); },
                k() { this.$refs.nodePane.selectPreviewUp(); },
            }
        };
    },
    watch: {
        ast: {
            immediate: true,
            async handler() {
                if (!this.ast) return;
                await this.ast.ready();
                this.nodePath = this.ast.script.find(j.Program).get();
            }
        }
    },
    created() {
        pairs(this.bindings).forEach(([shortcut, handler]) =>
            Mousetrap.bind(shortcut, handler.bind(this))
        );
    },
    destroyed() {
        pairs(this.bindings).forEach(([shortcut, _]) =>
            Mousetrap.unbind(shortcut)
        );
    },
    computed: {
        // it feels like there's an abstraction here waiting to be pulled out
        // something about 
        previewVal() {
            if (!this.toPreview) return null;
            return this.nodePath.get(this.toPreview).value;
        },
        previewNode() {
            this.teardownPreviewShortcuts();
            this.previewPos = 0;

            if (!this.toPreview) return null;

            this.setupPreviewShortcuts();

            if (Array.isArray(this.previewVal)) {
                this.setupArrayNavigation();
                return this.nodePath.get(this.toPreview, this.previewPos).value;
            }
            return this.previewVal;
        }
    },
    methods: {
        setupPreviewShortcuts() {
            Mousetrap.bind('enter', () => {
                const oldPath = this.nodePath;
                this.nodePath = Array.isArray(this.previewVal) ?
                    this.nodePath.get(this.toPreview, this.previewPos) :
                    this.nodePath.get(this.toPreview);
                // if there isn't a node there, don't go forward
                if (!this.nodePath.value) {
                    this.nodePath = oldPath;
                    return;
                }
                this.toPreview = null;
            });
        },
        teardownPreviewShortcuts() {
            Mousetrap.unbind('enter');
            this.teardownArrayNavigation();
        },
        setupArrayNavigation() {
            Mousetrap.bind('shift+j', () => {
                if (this.previewPos < this.toPreview.length - 1)
                    this.previewPos++;
            });
            Mousetrap.bind('shift+k', () => {
                if (this.previewPos > 0)
                    this.previewPos--;
            });
        },
        teardownArrayNavigation() {
            Mousetrap.unbind('shift+j');
            Mousetrap.unbind('shift+k');
        },
    }
}
</script>



<template>
<div>
    <NodePath v-if="nodePath" :node-path="nodePath" />
    <NodePane v-if="nodePath" ref="nodePane" :node="nodePath.value" @preview="field => toPreview = field" />
    <div v-if="toPreview">
        <hr class="border-gray-800 border-2" />
        <div class="header">child preview</div>
        <div v-if="Array.isArray(previewVal)">
            selected child: {{ previewPos + 1 }} of {{ previewVal.length }}
        </div>
        <NodePane :node="previewNode" />
    </div>
    <VPrompts v-bind="{ prompts }" />
</div>
</template>