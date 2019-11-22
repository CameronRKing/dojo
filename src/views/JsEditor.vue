<script>
import j from 'jscodeshift';
import BasicPanes from '@/components/BasicPanes.vue';
import AstNavigator from '@/components/AstNavigator.vue';
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
            asts: {},
            currFile: null,
            FileTab,
        }
    },
    computed: {
        ast() {
            if (!(this.currFile && this.asts[this.currFile])) return null;
            return this.asts[this.currFile];
        }
    },
    methods: {
        async syncAst({ path, content }) {
            if (!path) return;
            this.currFile = path;
            if (!this.asts[path]) {
                // since the JS code is represented as a JS string, slashes need to be double-escaped
                // else you get "unterminated string constant" errors because
                // the slashes get used up by the parser
                // console.log(content.replace(/\\/g, '\\\\'))
                const ast = new VueComponent(content);
                await ast.ready();
                this.$set(this.asts, path, ast);
            }
        },
        updateAst() {
            console.log('running');
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
        @change="updateAst"
        @focus-ast="focusAst"
    />
    <!-- <CodeMirror class="flex-grow flex-1" v-model="file" /> -->
</div>
</template>