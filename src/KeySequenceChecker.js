import Mousetrap from 'mousetrap';

function debounce(fn, wait) {
    let lastCall, scheduledCall;
    return (...args) => {
        lastCall = Date.now();
        if (scheduledCall) clearTimeout(scheduledCall);
        scheduledCall = setTimeout(() => fn(...args), wait);
    }
}

const modifiers = [
    {binding: 'ctrl', attr: 'ctrlKey', key: 'Control'},
    {binding: 'alt', attr: 'altKey', key: 'Alt'},
    {binding: 'shift', attr: 'shiftKey', key: 'Shift'},
];

const modAttrs = modifiers.map(m => m.attr);
const modKeys = modifiers.map(m => m.key);
const bindings = modifiers.map(m => m.binding);

export default class KeySequenceChecker {
    constructor(el, sequence='', { success, failure }) {
        this.el = el;
        this.el.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.mousetrap = new Mousetrap(el);
        this.sequence = sequence;
        this.handlers = { success, failure };
        this.keydowns = [];
        this.alertFailure = null;
        
        if (this.sequence) {
            this.initialize();
        }
    }

    setSequence(seq) {
        this.mousetrap.unbind(this.sequence);
        this.sequence = seq;
        this.initialize();
    }

    initialize() {
        this.keydowns = [];
        this.mousetrap.bind(this.sequence, () => this.emit('success'));
        this.alertFailure = debounce(() => this.emit('failure', this.stringifyKeydowns()), 300);
    }

    emit(event, payload) {
        this.handlers[event](payload);
    }

    stringifyKeydowns() {
        return this.keydowns
            .filter(e => !modKeys.includes(e.key))
            .map(e => this.stringifyKeydown(e))
            .join(' ')
    }

    stringifyKeydown(event) {
        const mods = this.modifiersInEvent(event).map(m => m.binding).join('+');
        const key = event.code.replace('Key', '').toLowerCase();
        return mods ? `${mods}+${key}` : key;
    }

    modifiersInEvent(event) {
        return modifiers.filter(({ attr }) => event[attr]);
    }

    handleKeydown(event) {
        this.keydowns.push(event);
        // for some reason I cannot discover, pressing 'Alt' in an input in Chrome focuses away
        if (event.key == "Alt") event.preventDefault();
        
        if (this.isModifier(event)) return;
        
        const nextCombo = this.getNextKeyCombo(event);
        if (!nextCombo) return;
        if (this.isWrong(nextCombo, event)) {
            this.alertFailure();
        }
    }

    getNextKeyCombo(event) {
        let keypressIdx = this.keydowns.filter(e => !modKeys.includes(e.key)).length - 1;
        if (keypressIdx == -1) keypressIdx = 0;
        return this.sequence.split(' ')[keypressIdx];
    }

    isModifier(event) {
        return modKeys.some(key => event.key == key);
    }

    isWrong(nextCombo, event) {
        return !nextCombo.includes(event.key) ||
            this.hasUnexpectedModifier(nextCombo, event) ||
            this.isMissingModifier(nextCombo, event)
    }

    hasUnexpectedModifier(nextCombo, event) {
        return bindings.some(binding =>
            !nextCombo.includes(binding) && event[`${binding}Key`])
    }

    isMissingModifier(nextCombo, event) {
        return bindings.some(binding =>
            nextCombo.includes(binding) && !event[`${binding}Key`])
    }
}