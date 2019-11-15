<script>
import BaseMode from './BaseMode.js';
import { bindShortcuts, unbindShortcuts, editTailwindClasses } from '@/TailwindEditor.js';

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
        };
    },
    mounted() {
        bindShortcuts(givenClass => {
            editTailwindClasses(this.selection, givenClass);
            this.userInput = '';
        });
    },
    destroyed() {
        unbindShortcuts();
    }
}</script>



<template>
<div>
    <p v-for="[key, action] in prompts">{{ key }}: {{ action }}</p>
    <input v-model="userInput" ref="input" class="mousetrap" />
</div>
</template>