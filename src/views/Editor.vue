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
        }
    }
}
</script>



<template>
<div class="flex justify-start">
    <ul>
        <li v-for="name in storyNames" @click="selectStory(name)">{{ name }}</li>
    </ul>
    <ElementHierarchy v-if="storyLoaded" :root="$refs.story.$el" />
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
    <!-- first, display all stories to left -->
    <!-- once one is selected, display navigation sidebar -->
    <!-- from then on, it's keyboard interaction in the middle -->
</div>
</template>