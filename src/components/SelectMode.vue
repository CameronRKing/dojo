<script>
import Mousetrap from 'mousetrap';

export default {
    props: ['elList'],
    data() {
        return {
            prompts: [
                ['up/down', 'change selection'],
                ['enter', 'confirm selection']
            ]
        };
    },
    mounted() {
        Mousetrap.bind('up', () => this.elList.moveCursorUp());
        Mousetrap.bind('down', () => this.elList.moveCursorDown());
        Mousetrap.bind('enter', () => this.confirmSelection());
    },
    methods: {
        confirmSelection() {
            console.log('emitting');
            this.$emit('new-mode', {
                mode: 'edit',
                selection: this.elList.selectUnderCursor()
            });
        }
    }
}
</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
</div>
</template>