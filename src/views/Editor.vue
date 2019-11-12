<script>
import * as stories from '@/stories/index.stories.js';
import ElementHierarchy from '@/components/ElementHierarchy';
import { editTailwindClasses, bindShortcuts, unbindShortcuts } from '@/TailwindEditor';
import Mousetrap from 'mousetrap';


export default {
    components: {
        ...stories,
        ElementHierarchy,
    },
    data() {
        return {
            focused: 'storylist',
            highlightedStory: 0,
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
        }
    },
    created() {
        window.stories = this;
        const dec = (val) => { if (val > 0) val--; };
        const inc = (val, arr) => { if (val < arr.length) val++; };
        Mousetrap.bind('up', () => {
            if (this.focused == 'storylist') {
                dec(this.highlightedStory);
            }
        })

        Mousetrap.bind('enter', () => {
            if (this.focused == 'storylist') {
                this.selectStory(this.storyNames[this.highlightedStory]);
            }
        })

        Mousetrap.bind('down', () => {
            if (this.focused == 'storylist') {
                inc(this.highlightedStory, this.storyNames);
            }

            // if (this.focused == 'elements') {
            //     inc(this.highlightedElement, this.)
            // }
        })

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
    <ul @focus="focused = 'storylist'">
        <li v-for="(name, idx) in storyNames" @click="selectStory(name)" :class="{'bg-gray-200': idx == highlightedStory}">{{ name }}</li>
    </ul>
    <ElementHierarchy v-if="storyLoaded"
        ref="els"
        :root="$refs.story.$el"
        @select="selectElement"
    />
    <component v-if="selectedStory" :is="selectedStory" ref="story" />
    <!-- first, display all stories to left -->
    <!-- once one is selected, display navigation sidebar -->
    <!-- from then on, it's keyboard interaction in the middle -->
</div>
</template>