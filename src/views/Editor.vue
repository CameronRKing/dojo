<script>
import * as stories from '@/stories/index.stories.js';

console.log(stories);
export default {
    components: {
        ...stories
    },
    data() {
        return {
            selectedStory: null,
        };
    },
    computed: {
        storyNames() {
            return Object.keys(stories);
        }
    },
    methods: {
        selectStory(name) {
            this.selectedStory = name;
        }
    }
}
</script>



<template>
<div>
    <ul>
        <li v-for="name in storyNames" @click="selectStory(name)">{{ name }}</li>
    </ul>
    <component v-if="selectedStory" :is="selectedStory" />
    <!-- first, display all stories to left -->
    <!-- once one is selected, display navigation sidebar -->
    <!-- from then on, it's keyboard interaction in the middle -->
</div>
</template>