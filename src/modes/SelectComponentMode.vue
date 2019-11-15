<script>
import BaseMode from './BaseMode.js';

export default {
    mixins: [BaseMode],
    props: ['cmpList'],
    prompts: [
        ['up/down', 'change selection'],
        ['enter', 'confirm selection'],
        ['a', 'add new component'],
    ],
    bindings: {
        enter() { this.selectComponent(); },
        up() { this.cmpList.moveCursorUp(); },
        down() { this.cmpList.moveCursorDown(); },
        a() { this.newMode('AddComponent'); },
    },
    methods: {
        selectComponent() {
            const path = this.cmpList.selectUnderCursor();
            this.newMode('SelectElement', { path });
        },
        teardown() {
            this.cmpList.updateList();
        }
    }

}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
</div>
</template>