<script>
import j from 'jscodeshift';
import BasicPanes from '@/components/BasicPanes.vue';
import AstNavigator from '@/components/AstNavigator.vue';
import VueComponent from '@/VueComponent.js';
import FileTab from '@/FileTab.js';
import { debounce } from '@/utils.js';

window.j = j;

export default {
    components: {
        BasicPanes,
        AstNavigator,
    },
    data() {
        return {
            asts: {},
            currFile: null,
            FileTab,
        }
    },
    computed: {
        ast() {
            if (!(this.currFile && this.asts[this.currFile])) return null;
            return this.asts[this.currFile];
        },
        changeHandler() {
            return debounce(this.syncAst, 500);
        }
    },
    methods: {
        debounce,
        async syncAst({ path, content }) {
            if (!path) return;
            const ast = new VueComponent(content);
            await ast.ready();
            this.$set(this.asts, path, ast);
            this.currFile = path;
        },
        focusAst() {
            this.$refs.astNav.focus();
        },
        focusSource() {
            this.$refs.source.focus();
        }
    }
}
</script>



<template>
<div class="flex h-full">
    <AstNavigator v-if="ast"
        ref="astNav"
        :ast="ast"
        class="flex-grow flex-1"
        @focus-source="focusSource"
    />

    <BasicPanes ref="source"
        :tab-type="FileTab"
        class="flex-grow flex-1"
        @select="syncAst"
        @change="changeHandler"
        @focus-ast="focusAst"
    />
    <!-- <CodeMirror class="flex-grow flex-1" v-model="file" /> -->
</div>
</template>