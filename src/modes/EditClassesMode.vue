<script>
import BaseMode from './BaseMode.js';
import {
    allClasses,
    classToShortcut, shortcutToClass,
    bindShortcuts, unbindShortcuts,
    editTailwindClasses
} from '@/TailwindEditor.js';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'back to selection'],
        ['space/enter', 'toggle typed class'],
        ['ctrl+a', 'manage shortcuts'],
        ['<>', '"no shortcut"'],
        // ['up/down', 'browse classes'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.prevMode(); },
        space() { this.toggleClass(); },
        enter() { this.toggleClass(); },
        'ctrl+a'() { this.newMode('ManageClassShortcuts') },
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
            const matchedShortcuts = this.matchedShortcuts(this.userInput);
            const matchedClasses = this.matchedClasses(this.userInput, matchedShortcuts);
            return matchedShortcuts.concat(matchedClasses);
        }
    },
    created() {
        this.updateClassView()
    },
    methods: {
        updateClassView() {
            this.classList = Array.from(this.selection.el.classList);
            this.maskedClasses = this.classList.map(cclass => {
                if (classToShortcut[cclass]) return classToShortcut[cclass];
                return cclass;
            });
        },
        matchedShortcuts(trigger) {
            const regex = new RegExp('^' + trigger);
            return Object.keys(shortcutToClass)
                .filter(shortcut => shortcut.match(regex))
                .map(shortcut => [shortcut, shortcutToClass[shortcut]]);
        },
        matchedClasses(trigger, matchedShortcuts) {
            const alreadyMatchedClasses = matchedShortcuts.map(([_, cclass]) => cclass);
            const regex = new RegExp('^' + trigger);
            return allClasses.filter(cclass => cclass.match(regex) && !alreadyMatchedClasses.includes(cclass))
                .map(cclass => ['<>', cclass]);
        },
        toggleClass() {
            const trigger = this.userInput.replace(' ', '');
            const matchedShortcuts = this.matchedShortcuts(trigger);
            if (matchedShortcuts.length) {
                this.editClass(matchedShortcuts[0][1]);
                return;
            }
            const matchedClasses = this.matchedClasses(trigger, []);
            if (matchedClasses.length) {
                this.editClass(matchedClasses[0][1]);
                return;
            }
            window.alert('No shortcut or class found for ' + this.userInput);
            this.userInput = this.userInput.replace(' ', '');
        },
        editClass(givenClass) {
            editTailwindClasses(this.selection, givenClass);
            this.selection.save();
            // for some reason, this has been running BEFORE the space gets entered
            // so the space triggers all this action, then it gets added to the input
            // after it's all been done
            setTimeout(() => this.userInput = '', 16);
            this.updateClassView();
        }
    },
    destroyed() {
        unbindShortcuts();
    }
}</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
    <br />
    <p>current: {{ maskedClasses.join(' ') }}</p>
    <input v-model="userInput" ref="input" class="mode-input mousetrap" />
    <ul class="h-64 overflow-auto">
        <li v-for="[shortcut, cclass] in available">{{ shortcut }}: {{ cclass }}</li>
    </ul>
</div>
</template>