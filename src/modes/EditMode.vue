<script>
import BaseMode from './BaseMode';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'back to selection'],
        ['t', 'change tag'],
        ['a', 'add child'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.$emit('old-mode'); },
        t() { this.$emit('new-mode', { mode: 'ChangeTag', args: { selection: this.selection } }); },
        a() { this.$emit('new-mode', { mode: 'AddChild', args: { selection: this.selection } }); },
        d() { this.selection.delete(); this.$emit('old-mode'); }
    },
}
</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
</div>
</template>