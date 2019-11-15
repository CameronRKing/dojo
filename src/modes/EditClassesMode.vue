<script>
import BaseMode from './BaseMode.js';
import {
    classToShortcut, shortcutToClass,
    bindShortcuts, unbindShortcuts,
    editTailwindClasses
} from '@/TailwindEditor.js';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'back to selection'],
        ['space', 'toggle typed class'],
        // ['up/down', 'browse classes'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.$emit('old-mode'); },
    },
    data() {
        return {
            userInput: '',
            classList: [],
            maskedClasses: [],
        };
    },
    computed: {
        available() {
            return Object.keys(shortcutToClass)
                .filter(shortcut => shortcut.match(this.userInput))
                .map(shortcut => [shortcut, shortcutToClass[shortcut]]);
        }
    },
    methods: {
        updateClassView() {
            this.classList = Array.from(this.selection.el.classList);
            this.maskedClasses = this.classList.map(cclass => {
                if (classToShortcut[cclass]) return classToShortcut[cclass];
                return cclass;
            });
        }
    },
    mounted() {
        bindShortcuts(givenClass => {
            editTailwindClasses(this.selection, givenClass);
            this.selection.save();
            this.userInput = '';
            this.updateClassView();
        });
    },
    destroyed() {
        unbindShortcuts();
    }
}</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
    <br />
    <p>current: {{ maskedClasses.join(' ') }}</p>
    <input v-model="userInput" ref="input" class="mousetrap" />
    <ul>
        <li v-for="[shortcut, cclass] in available">{{ shortcut }}: {{ cclass }}</li>
    </ul>
</div>
</template>