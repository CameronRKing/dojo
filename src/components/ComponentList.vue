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
    created() {
        fs.vueFilesIn('src/test')
            .then(cmps => this.cmps = cmps);
    }
}
</script>



<template>
<VList :list="cmps" @select="cmp => $emit('select', cmp)" />
</template>