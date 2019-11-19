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
    created() {
        window.editor = this;
    },
    mounted() {
        this.switchMode({ mode: 'SelectComponent', args: { cmpList: this.$refs.cmpList } });
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
            console.log(path);
            this.selectedStory = (await import('../' + path.replace('src/', ''))).default;
            // $refs take a tick to get on the page
            // changes in $refs don't appear to trigger cascades
            this.$nextTick(() => {
                this.storyReady = true;

                this.$nextTick(() => {
                    this.switchMode({ mode: 'SelectElement', args: { elList: this.$refs.elList } });
                })
            });
        },
        async switchMode({ mode, args }) {
            // moving from component selection to element selection is hairy
            // since they rely on $refs injected by the editor
            // not sure how to handle this quite yet
            if (mode == 'SelectElement' && !args.elList) {
                this.selectCmp(args.path);
                return;
            }
            const modeCmp = (await import(`../modes/${mode}Mode.vue`)).default;
            this.modeStack.push({ mode: modeCmp, args })
        },
        popMode() {
            const lastMode = this.modeStack.pop();
            this.$nextTick(() => {
                if (typeof this.$refs.mode.teardown == 'function') {
                    this.$refs.mode.teardown(lastMode.args);
                }
                // moving back to component selection entails resetting the story
                // which isn't within the purview of any of the modes (for now)
                if (this.modeStack.length == 1) {
                    this.selectedStory = null;
                    this.storyReady = false;
                }
            });
        },
        replaceMode({ mode, args }) {
            this.popMode();
            this.switchMode({ mode, args });
        },
    },
    path: __filename
};
</script>



<template>
<div class="flex justify-start h-full">
    <ComponentList ref="cmpList" />
    <ElementHierarchy v-if="storyReady"
        :root="() => $refs.story.$el"
        ref="elList"
    />
    <component v-if="mode" :is="mode" v-bind="modeArgs"
        ref="mode"
        class="p-2 text-gray-800 bg-gray-200"
        @new-mode="switchMode"
        @old-mode="popMode"
        @replace-mode="replaceMode"
    />
    <div class="flex justify-center flex-grow">
        <component v-if="selectedStory" :is="selectedStory" ref="story" />
    </div>
</div>
</template>