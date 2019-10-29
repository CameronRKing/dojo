<script>
import Mosuetrap from 'mousetrap';

const modifiers = [
    {bind: 'ctrl', attr: 'ctrlKey', key: 'Control'},
    {bind: 'alt', attr: 'altKey', key: 'Alt'},
    {bind: 'shift', attr: 'shiftKey', key: 'Shift'},
];

const modAttrs = modifiers.map(m => m.attr);
const modKeys = modifiers.map(m => m.key);
const mods = modifiers.map(m => m.bind);

export default {
    data() {
        return {
            expected: '',
            mousetrap: null,
            message: '',
            keypresses: [],
            keydowns: [],
            keyups: [],
        }
    },
    mounted() {
        this.mousetrap = new Mousetrap(this.$refs.input);
        this.initialize();
    },
    watch: {
        expected(val, oldVal) {
            this.mousetrap.unbind(oldVal);
            this.initialize();
        }
    },
    methods: {
        initialize() {
            this.message = '';
            if (this.expected) 
                this.mousetrap.bind(this.expected, this.alertSuccess);
        },
        alertSuccess(event) {
            event.preventDefault();
            this.$emit('success');
            this.message = 'correct!';
        },
        alertFailure() {
            this.$emit('failure');
            this.message = this.keydowns
                .filter(e => !modKeys.includes(e.key))
                .map(this.stringifyKeypress)
                .join(' ')
        },
        stringifyKeypress(event) {
            const mods = modifiers.filter(({ attr }) => event[attr]).map(m => m.bind).join('+');
            const key = event.code.replace('Key', '').toLowerCase();
            return mods ? `${mods}+${key}` : key;
        },
        handleKeypress(event) {
            this.keypresses.push(event);
        },
        hasUnexpectedModifier(nextSequence, event) {
            return mods.some(modifier =>
                !nextSequence.includes(modifier) && event[`${modifier}Key`])
        },
        isMissingModifier(nextSequence, event) {
            return mods.some(modifier =>
                nextSequence.includes(modifier) && !event[`${modifier}Key`])
        },
        handleKeydown(event) {
            this.keydowns.push(event);
            // for some reason I cannot discover, pressing 'Alt' in an input in Chrome focuses away
            if (event.key == "Alt") event.preventDefault();
            const keypressIdx = this.keydowns.filter(e => !modKeys.includes(e.key)).length - 1;
            if (keypressIdx >= this.expected.split(' ').length) {
                this.alertFailure(event);
            }

            const nextSequence = this.expected.split(' ')[keypressIdx]
            modifiers.forEach(({ key, bind }) => {
                if (event.key == key && !this.expected.includes(bind)) {
                    this.alertFailure(event)
                }
            })
            // if (['Control', 'Alt', 'Shift'].includes(event.key)) return;

            if (this.isWrong(nextSequence, event)) {
                this.alertFailure();
            }
        },
        isWrong(event) {
            return !this.expected.includes(event.key) ||
                this.hasUnexpectedModifier(nextSequence, event) ||
                this.isMissingModifier(nextSequence, event)
        },
        handleKeyup(event) {
            this.keyups.push(event);
            // keyCode/which is a keyboard code
        },
    }
}
</script>



<template>
<div>
    <input
        style="height: 10px; width: 100px"
        ref="input"
        data-cy="key-input"
        @input="(e) => e.target.value = ''"
        @keypress="handleKeypress"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
    />

    <span>{{ message }}</span>
</div>
</template>