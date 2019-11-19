<script>
import j from 'jscodeshift';
import CodeMirror from '@/components/CodeMirror.vue';
import AstNavigator from '@/components/AstNavigator.vue';
import fs from '@/fs-client.js';
import VueComponent from '@/VueComponent.js';

window.j = j;

export default {
    components: {
        CodeMirror,
        AstNavigator,
    },
    data() {
        return {
            file: '',
            ast: null,
        }
    },
    watch: {
        file() {
            this.ast = new VueComponent(this.file);
            window.ast = this.ast;

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
    <AstNavigator class="flex-grow flex-1" v-if="ast" :ast="ast" />
    <CodeMirror class="flex-grow flex-1" v-model="file" />
</div>
</template>