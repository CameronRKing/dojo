<script>
import ElementHierarchy from '@/components/ElementHierarchy';
import SelectMode from '@/components/SelectMode';
import ComponentList from '@/components/ComponentList';
import { editTailwindClasses, bindShortcuts, unbindShortcuts } from '@/TailwindEditor';
import VList from '@/components/VList';


export default {
    components: {
        ComponentList,
        ElementHierarchy,
        SelectMode,
        VList,
    },
    data() {
        return {
            selectedStory: null,
            storyReady: false,
            elsReady: false,
        };
    },
    computed: {
        storyNames() {
            return Object.keys(stories);
        },
    },
    methods: {
        async selectCmp(path) {
            this.selectedStory = (await import('../' + path.replace('src/', ''))).default;
            this.$nextTick(() => {
                this.storyReady = true;

                this.$nextTick(() => {
                    this.elsReady = true;
                })
            });
        },
        switchMode(args) {
            // todo!
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
    <SelectMode  v-if="elsReady"
        :el-list="$refs.elList"
        @new-mode="switchMode"
    />
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
</div>
</template>