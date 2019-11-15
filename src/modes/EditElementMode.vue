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
        t() { this.newMode('ChangeTag', { selection: this.selection }); },
        a() { this.newMode('AddChild', { selection: this.selection }); },
        c() { this.newMode('EditClasses', { selection: this.selection }); },
        d() { this.selection.delete(); this.$emit('old-mode'); }
    },
}
</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
</div>
</template>