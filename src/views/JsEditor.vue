<script>
import j from 'jscodeshift';
import BasicPanes from '@/components/BasicPanes.vue';
import ComponentPane from '@/components/ComponentPane.vue';
import AstNavigator from '@/components/AstNavigator.vue';
import VueComponent from '@/VueComponent.js';
import FileTab from '@/FileTab.js';
import { debounce } from '@/utils.js';

export default {
    components: {
        BasicPanes,
        ComponentPane,
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
        },
        importComponent(path, fileTab) {
            this.ast.importComponent(path);
            fileTab.content = this.ast.toString();
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

<!--     <ComponentPane v-if="ast"
		ref="cmpPane"
		:ast="ast"
		class="flex-grow max-w-md"
		@focus-source="focusSource"
	/>
 -->    
    <BasicPanes ref="source"
        :tab-type="FileTab"
        class="flex-grow flex-1"
        @select="syncAst"
        @change="changeHandler"
        @import-component="importComponent"
        @focus-ast="focusAst"
    />
    <!-- <CodeMirror class="flex-grow flex-1" v-model="file" /> -->
</div>
</template>