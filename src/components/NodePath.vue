<script>
import { getNodeParentChain } from '@/node-utils.js';
import { showType } from '@/utils.js'

export default {
    props: ['nodePath'],
    computed: {
        nodeChain() {
            if (!this.nodePath) return [];
            return getNodeParentChain(this.nodePath);
        }
    },
    methods: {
        showType,
    } 
}

</script>



<template>
<div class="bg-gray-200">
    <span v-for="(link, idx) in nodeChain.reverse()">
        {{ showType(link.type) }}<span v-if="link.field">.{{ link.field }}</span>
        <span v-if="link.pos">[{{link.pos}}]</span>
        <span v-if="idx != nodeChain.length - 1">&nbsp;>&nbsp;</span>
    </span>
</div> 
</template>