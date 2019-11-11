<script>
import * as stories from '@/stories/index.stories.js';
import ElementHierarchy from '@/components/ElementHierarchy';
import Mousetrap from 'mousetrap';

const tailwindShortcuts = {
    /* display flex */
    'df': 'flex',
    'dfr': 'flex-row-reverse',
    'dfc': 'flex-column',
    'dfcr': 'flex-column-reverse',
    /* justify content */
    'js': 'justify-start',
    'jc': 'justify-center',
    'je': 'justify-end',
    'ja': 'justify-around',
    'jb': 'justify-between',
    /* align items */
    'is': 'items-start',
    'ir': 'items-stretch',
    'ic': 'items-center',
    'ie': 'items-end',
    'ib': 'items-baseline',
};

function containsTailwindFamilyMember(list, givenClass) {
    const prefix = givenClass.split('-').slice(0, -1).join('-');

    return Array.from(list).find(name => name.startsWith(prefix));
}

function bindTailwindShortcuts(vm) {
    Object.keys(tailwindShortcuts)
        .forEach((shortcut) =>
            Mousetrap.bind(
                shortcut.split('').join(' ') + ' space',
                () => vm.updateTailwindClasses(tailwindShortcuts[shortcut])
            )
        );
}

function unbindTailwindShortcuts() {
    Object.keys(tailwindShortcuts)
        .forEach((shortcut) => {
            Mousetrap.unbind(shortcut + ' ');
        })
}

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
    created() {
        window.vm = this;
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
            bindTailwindShortcuts(this);
        },
        updateTailwindClasses(givenClass) {
            const list = this.selectedElement.classList;
            // if it's already there, typing the class shortcut deletes it
            if (list.contains(givenClass)) {
                list.remove(givenClass);
            } else {
                // if there's a class from the same family, this one replaces it
                const familyMember = containsTailwindFamilyMember(list, givenClass);
                if (familyMember) {
                    list.replace(familyMember, givenClass);
                } else {
                    // if it's not there and there's nothing like it, throw it on the pile
                    list.add(givenClass);
                }
            }


            this.updateClasses(this.selectedElement.className);
        },
        updateClasses(classStr) {
            this.$socket.emit('setClass', [
                this.cmpPath,
                this.selectedElement.getAttribute('data-palette'),
                classStr
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