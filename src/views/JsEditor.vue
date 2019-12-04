<script>
import j from 'jscodeshift';
import BasicPanes from '@/components/BasicPanes.vue';
import ComponentPane from '@/components/ComponentPane.vue';
import AstNavigator from '@/components/AstNavigator.vue';
import VueComponent from '@/VueComponent.js';
import FileTab from '@/FileTab.js';

export default {
    components: {
        BasicPanes,
        ComponentPane,
        AstNavigator,
    },
    data() {
        return {
            currFile: null,
            FileTab,
        }
    },
    methods: {
        focusAst() {
            if (!this.$refs.astNav) return;
            this.$refs.astNav.focus();
        },
        focusSource() {
            if (!this.$refs.source) return;
            this.$refs.source.focus();
        },
    }
}
</script>



<template>
<div class="flex h-full">
<!--     <AstNavigator v-if="ast"
        ref="astNav"
        :ast="ast"
        class="flex-grow flex-1"
        @focus-source="focusSource"
    /> -->

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
        @focus-ast="focusAst"
    />
    <!-- <CodeMirror class="flex-grow flex-1" v-model="file" /> -->
</div>
</template>