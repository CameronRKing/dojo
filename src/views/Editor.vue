<script>
import * as stories from '@/stories/index.stories.js';
import ElementHierarchy from '@/components/ElementHierarchy';
import { editTailwindClasses, bindShortcuts, unbindShortcuts } from '@/TailwindEditor';
import Mousetrap from 'mousetrap';
import VList from '@/components/VList';


function getVueParent(el) {
    let vueParent;
    let node = el;
    do {
        vueParent = node.__vue__;
        node = node.parentNode;
    } while (!vueParent && node)

    if (!vueParent) {
        throw new Error('unable to find a Vue component in the hierarchy above ' + el);
    }
    return vueParent;
}

export default {
    components: {
        ...stories,
        ElementHierarchy,
        VList,
    },
    data() {
        return {
            selectedStory: null,
            storyLoaded: false,
            selectedElement: null,
            parentComponent: null,
            parsedCmp: null,
        };
    },
    computed: {
        storyNames() {
            return Object.keys(stories);
        },
        cmpPath() {
            if (!this.parentComponent) {
                return '';
            }
            return this.parentComponent.$options.path.split('?')[0];
        },
    },
    created() {
        window.stories = this;
    },
    watch: {
        async cmpPath(path) {
            if (path.length) {
                this.parsedCmp = new VueComponent(await fs.read(path));
            } else {
                this.parsedCmp = null;
            }
        },
    },
    methods: {
        selectStory(name) {
            this.selectedStory = name;
            this.$nextTick().then(() => {
                // I was having problems with the v-if on ElementHierarchy
                // v-if="selectedStory" was reading as true before the $ref was set
                // v-if="$refs.story" wasn't updating
                // (but I was probably doing something wrong)
                this.storyLoaded = true;
            });
        },
        selectElement(el) {
            this.selectedElement = el;
            this.parentComponent = getVueParent(el);
            this.$socket.emit('addPaletteIds', this.cmpPath);
            bindShortcuts((newClass) => {
                editTailwindClasses(this.parsedCmp, this.selectedElement, newClass);
            });
        },
    },
    path: __filename
};
</script>



<template>
<div class="flex justify-start">
    <VList :list="storyNames" @select="selectStory">
        <template slot-scope="{ item }">{{ item }}</template>
    </VList>
    <ElementHierarchy v-if="storyLoaded"
        :root="$refs.story.$el"
        @select="selectElement"
    />
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
    <!-- first, display all stories to left -->
    <!-- once one is selected, display navigation sidebar -->
    <!-- from then on, it's keyboard interaction in the middle -->
</div>
</template>