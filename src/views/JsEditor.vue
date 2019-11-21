<script>
import j from 'jscodeshift';
import BasicPanes from '@/components/BasicPanes.vue';
import AstNavigator from '@/components/AstNavigator.vue';
import fs from '@/fs-client.js';
import VueComponent from '@/VueComponent.js';
import FileTab from '@/FileTab.js';

window.j = j;

export default {
    components: {
        BasicPanes,
        AstNavigator,
    },
    data() {
        return {
            file: '',
            ast: null,
            FileTab,
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
}
</script>



<template>
<div class="flex h-full">
    <AstNavigator class="flex-grow flex-1" v-if="ast" :ast="ast" />
    <BasicPanes :tab-type="FileTab" class="flex-grow flex-1" />
    <!-- <CodeMirror class="flex-grow flex-1" v-model="file" /> -->
</div>
</template>