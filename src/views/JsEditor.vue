<script>
import j from 'jscodeshift';
import CodeMirror from '@/components/CodeMirror.vue';
import NodePane from '@/components/NodePane.vue';
import fs from '@/fs-client.js';
import VueComponent from '@/VueComponent.js';


export default {
    components: {
        CodeMirror,
        NodePane,
    },
    data() {
        return {
            file: '',
            ast: null,
            nodePath: null,
        }
    },
    watch: {
        async file() {
            this.ast =  new VueComponent(this.file);
            await this.ast.ready();
            this.nodePath = this.ast.script.find(j.Program).get();
            window.nodePath = this.nodePath;
        }
    },
    created() {
        fs.read('src/test/App.vue')
            .then(file => this.file = file);
    },
    methods: {

    }
}
</script>



<template>
<div class="flex h-full">
    <NodePane v-if="nodePath" :node-path="nodePath" />
    <CodeMirror class="flex-grow" v-model="file" />
</div>
</template>