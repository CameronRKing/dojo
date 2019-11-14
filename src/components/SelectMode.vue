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
    teardown({ selection }) {
        selection.removeDataIds();
    },
    methods: {
        confirmSelection() {
            const selection = new NodeLink(this.elList.selectUnderCursor().el);
            selection.ready().then(() => selection.addDataIds());
            this.$emit('new-mode', {
                mode: 'Edit',
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