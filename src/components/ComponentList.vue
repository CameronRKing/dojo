<script>
import fs from '@/fs-client.js';
import VList from '@/components/VList';

export default {
    components: {
        VList
    },
    data() {
        return {
            cmps: [],
        }
    },
    mounted() {
        this.updateList();
    },
    methods: {
        updateList() {
            this.$refs.list.selected = null;
            fs.vueFilesIn('src/test')
                .then(cmps => this.cmps = cmps);
        },
        moveCursorUp() {
            this.$refs.list.moveCursorUp();
        },
        moveCursorDown() {
            this.$refs.list.moveCursorDown();
        },
        selectUnderCursor() {
            return this.$refs.list.selectUnderCursor();
        },
    }
}
</script>



<template>
    <VList ref="list" :list="cmps" @select="cmp => $emit('select', cmp)" />
</template>