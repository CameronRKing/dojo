<script>
import j from 'jscodeshift';
import NodePath from '@/components/NodePath';
import NodePane from '@/components/NodePane';
import Mousetrap from 'mousetrap';

export default {
    components: {
        NodePath,
        NodePane,
    },
    props: ['ast'],
    data() {
        return {
            nodePath: null,
            toPreview: null,
            previewPos: 0,
            prompts: [
                'c', 'navigate children',
                'j', 'move down',
                'k', 'move up',
                'shift+j', '++childArrayIdx',
                'shift+k', '--childArrayIdx',
            ]
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
        Mousetrap.bind('tab', () => this.nodePath = this.nodePath.parent);
    },
    computed: {
        previewVal() {
            if (!this.toPreview) return null;

            return this.nodePath.get(this.toPreview).value;
        },
        previewNode() {
            this.teardownPreviewShortcuts();

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
                this.nodePath = Array.isArray(this.previewVal) ?
                    this.nodePath.get(this.toPreview, this.previewPos) :
                    this.nodePath.get(this.toPreview);
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
    <NodePane v-if="nodePath" :node="nodePath.value" @preview="field => toPreview = field" />
    <div v-if="toPreview">
        <hr class="border-gray-800 border-2" />
        <div class="header">child preview</div>
        <div v-if="Array.isArray(previewVal)">
            selected child: {{ previewPos + 1 }} of {{ previewVal.length }}
        </div>
        <NodePane :node="previewNode" />
    </div>
</div>
</template>