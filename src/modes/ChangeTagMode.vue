<script>
import BaseMode from './BaseMode';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    data() {
        return {
            newTag: '',
        }
    },
    mounted() {
        this.$refs.input.focus();
    },
    bindings: {
        tab(e) { e.preventDefault(); this.$emit('old-mode'); },
        enter() { this.changeTag(); this.$emit('old-mode'); },
    },
    methods: {
        changeTag() {
            this.selection.findByDataId(node => {
                node.tag = this.newTag;
                return node;
            });
            this.selection.save();
        }
    }
}
</script>



<template>
<div>
    <h3>Change tag</h3>
    <p>tab: cancel</p>
    <p>Enter new tag, then press enter</p>
    <input v-model="newTag" tabindex="-1" ref="input" class="mousetrap" />
</div>
</template>