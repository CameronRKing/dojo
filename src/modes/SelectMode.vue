<script>
import BaseMode from './BaseMode.js';
import NodeLink from '@/NodeLink.js';

export default {
    mixins: [BaseMode],
    props: ['elList'],
    prompts: [
        ['up/down', 'change selection'],
        ['enter', 'confirm selection']
    ],
    bindings: {
        up() { this.elList.moveCursorUp(); },
        down() { this.elList.moveCursorDown(); },
        enter() { this.confirmSelection(); },
    },
    mounted() {
        this.elList.cancelSelection();
    },
    teardown({ selection }) {
        selection.off('save');
        this.elList.updateNodeList();
    },
    methods: {
        confirmSelection(tried=false) {
            const selected = this.elList.selectUnderCursor();
            let selection;
            // sometimes the ElementHierarchy list gets out of sync with what's on the page
            // it references a root node that is no longer on the document
            // I have no idea why. Can't reproduce it reliably.
            // a single refresh appears to work
            try {
                selection = new NodeLink(selected.el);
            } catch(e) {
                if (tried) throw e;
                this.elList.updateNodeList();
                this.$nextTick(() => {
                    this.confirmSelection(true);
                });
                return;
            }
            selection.on('save', () => this.elList.updateNodeList());
            this.$emit('new-mode', {
                mode: 'EditClasses',
                args: { selection }
            });
        },
    }
}
</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
</div>
</template>