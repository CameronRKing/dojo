<script>
import ElementHierarchy from '@/components/ElementHierarchy';
import ComponentList from '@/components/ComponentList';
import VList from '@/components/VList';


export default {
    components: {
        ComponentList,
        ElementHierarchy,
        VList,
    },
    data() {
        return {
            selectedStory: null,
            storyReady: false,
            modeStack: [],            
        };
    },
    computed: {
        storyNames() {
            return Object.keys(stories);
        },
        mode() {
            if (this.modeStack.length) {
                return this.modeStack[this.modeStack.length - 1].mode;
            }
            return null;
        },
        modeArgs() {
            if (this.modeStack.length) {
                return this.modeStack[this.modeStack.length - 1].args;
            }
            return null;
        }
    },
    methods: {
        async selectCmp(path) {
            this.selectedStory = (await import('../' + path.replace('src/', ''))).default;
            // $refs take a tick to get on the page
            // changes in $refs don't appear to trigger cascades
            this.$nextTick(() => {
                this.storyReady = true;

                this.$nextTick(() => {
                    this.switchMode({ mode: 'Select', args: { elList: this.$refs.elList } });
                })
            });
        },
        async switchMode({ mode, args }) {
            const modeCmp = (await import(`../components/${mode}Mode.vue`)).default;
            this.modeStack.push({ mode: modeCmp, args })
        },
        popMode() {
            const lastMode = this.modeStack.pop();
            this.$nextTick(() => {
                if (typeof this.$refs.mode.teardown == 'function') {
                    this.$refs.mode.teardown(lastMode.args);
                }
            });
        }
    },
    path: __filename
};
</script>



<template>
<div class="flex justify-start">
    <ComponentList @select="selectCmp" />
    <ElementHierarchy v-if="storyReady"
        :root="$refs.story.$el"
        ref="elList"
    />
    <component v-if="mode" :is="mode" v-bind="modeArgs" @new-mode="switchMode" @old-mode="popMode" ref="mode" />
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
</div>
</template>