<script>
import BaseMode from './BaseMode.js';

export default {
    mixins: [BaseMode],
    props: ['cmpList'],
    prompts: [
        ['k', 'move up'],
        ['j', 'move down'],
        ['enter', 'confirm selection'],
        ['a', 'add new component'],
    ],
    bindings: {
        enter() { this.selectComponent(); },
        k() { this.cmpList.moveCursorUp(); },
        j() { this.cmpList.moveCursorDown(); },
        a() { this.newMode('AddComponent'); },
    },
    methods: {
        selectComponent() {
            const path = this.cmpList.selectUnderCursor();
            this.$socket.emit('addDataIdsTo', path);
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