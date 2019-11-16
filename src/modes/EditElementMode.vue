<script>
import BaseMode from './BaseMode';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'back to selection'],
        ['t', 'change tag'],
        ['a', 'add child'],
        ['w', 'edit text'],
        ['c', 'edit classes'],
        ['m', 'move node'],
        ['d', 'delete node'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.prevMode(); },
        t() { this.newMode('ChangeTag', { selection: this.selection }); },
        a() { this.newMode('AddChild', { selection: this.selection }); },
        w() { this.newMode('EditTextChildren', { selection: this.selection }); },
        c() { this.newMode('EditClasses', { selection: this.selection }); },
        m() { this.newMode('MoveElement', { selection: this.selection }); },
        d() { this.selection.delete(); this.prevMode(); }
    },
}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
</div>
</template>