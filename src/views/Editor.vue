<script>
import * as stories from '@/stories/index.stories.js';
import ElementHierarchy from '@/components/ElementHierarchy';
export default {
    components: {
        ...stories,
        ElementHierarchy,
    },
    data() {
        return {
            selectedStory: null,
            storyLoaded: false,
            selectedElement: null,
            parentComponent: null,
        };
    },
    computed: {
        storyNames() {
            return Object.keys(stories);
        },
    },
    methods: {
        selectStory(name) {
            this.selectedStory = name;
            this.$nextTick().then(() => {
                window.vm = this.$refs.story
                this.storyLoaded = true;
            });
        },
        selectElement(el) {
            let vueParent;
            let node = el;
            do {
                vueParent = node.__vue__;
                node = node.parentNode;
            } while (!vueParent && node)

            if (!vueParent) {
                throw new Error('unable to find a Vue component in the hierarchy above ' + el);
            }

            this.selectedElement = el;
            this.parentComponent = vueParent;
            this.$socket.emit('addPaletteIds', this.parentComponent.$options.path.split('?')[0]);
        },
        updateClasses(classes) {
            this.$socket.emit('setClass', [
                this.parentComponent.$options.path,
                this.selectedElement.getAttribute('data-palette'),
                classes
            ]);
        }
    },
    path: __filename
};
</script>



<template>
<div class="flex justify-start">
    <ul>
        <li v-for="name in storyNames" @click="selectStory(name)">{{ name }}</li>
    </ul>
    <ElementHierarchy v-if="storyLoaded" :root="$refs.story.$el" @select="selectElement"/>
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
    <!-- first, display all stories to left -->
    <!-- once one is selected, display navigation sidebar -->
    <!-- from then on, it's keyboard interaction in the middle -->
</div>
</template>