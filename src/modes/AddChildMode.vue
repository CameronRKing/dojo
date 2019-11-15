<script>
import BaseMode from './BaseMode.js';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    bindings: {
        tab() { this.$emit('old-mode'); },
        enter() { this.addChild(); },
    },
    mounted() {
        this.$refs.input.focus();
    },
    data() {
        return {
            childStr: '',
        }
    },
    methods: {
        addChild() {
            this.selection.appendChild(this.childStr);
            this.selection.save();
            this.$emit('old-mode');
        },
    }
}
</script>



<template>
<div>
    <h3>Add child</h3>
    <p>tab: cancel</p>
    <p>enter: confirm</p>
    <input v-model="childStr" placeholder="div#id.class1" ref="input" class="mousetrap" />
</div>
</template>