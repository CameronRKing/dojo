<script>
import Mosuetrap from 'mousetrap';

const modifiers = [
    {binding: 'ctrl', attr: 'ctrlKey', key: 'Control'},
    {binding: 'alt', attr: 'altKey', key: 'Alt'},
    {binding: 'shift', attr: 'shiftKey', key: 'Shift'},
];

const modAttrs = modifiers.map(m => m.attr);
const modKeys = modifiers.map(m => m.key);
const mods = modifiers.map(m => m.binding);

export default {
    props: ['expected'],
    data() {
        return {
            mousetrap: null,
            keydowns: [],
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
            this.keydowns = [];
            if (this.expected) {
                this.mousetrap.bind(this.expected, this.alertSuccess);
            }
        },
        alertSuccess(event) {
            event.preventDefault();
            this.$emit('success');
        },
        alertFailure() {
            const actualKeypress = this.keydowns
                .filter(e => !modKeys.includes(e.key))
                .map(this.stringifyKeypress)
                .join(' ')
            this.$emit('failure', actualKeypress);
        },
        stringifyKeypress(event) {
            const mods = this.modifiersInEvent(event).map(m => m.binding).join('+');
            const key = event.code.replace('Key', '').toLowerCase();
            return mods ? `${mods}+${key}` : key;
        },
        modifiersInEvent(event) {
            return modifiers.filter(({ attr }) => event[attr]);
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

            let keypressIdx = this.keydowns.filter(e => !modKeys.includes(e.key)).length - 1;
            if (keypressIdx >= this.expected.split(' ').length) {
                this.alertFailure(event);
            }
            if (keypressIdx < 0) keypressIdx = 0;

            const nextSequence = this.expected.split(' ')[keypressIdx]

            modifiers.forEach(({ key, binding }) => {
                if (event.key == key && !nextSequence.includes(binding)) {
                    this.alertFailure(event)
                }
            })
            if (this.isWrong(nextSequence, event)) {
                this.alertFailure();
            }
        },
        isWrong(nextSequence, event) {
            return !nextSequence.includes(event.key) ||
                this.hasUnexpectedModifier(nextSequence, event) ||
                this.isMissingModifier(nextSequence, event)
        },
    }
}
</script>



<template>
    <input
        style="height: 10px; width: 100px"
        ref="input"
        data-cy="key-input"
        @input="(e) => e.target.value = ''"
        @keydown="handleKeydown"
    />
</template>