<script>
import BaseMode from './BaseMode.js';
import fs from '@/fs-client.js';
import shortcuts from '@/tailwind-shortcuts.json';

function mapInvert(obj) {
    return Object.keys(obj)
        .reduce((acc, key) => ({
            ...acc, [obj[key]]: key
        }), {});
}


export default {
    mixins: [BaseMode],
    prompts: [
        ['esc', 'cancel'],
        ['enter', 'add shortcut'],
        ['ctrl+d', 'delete shortcut for given class'],
    ],
    bindings: {
        esc(e) { e.preventDefault(); this.prevMode(); },
        enter() { this.updateShortcuts(); },
        'ctrl+d'(e) { e.preventDefault(); this.deleteShortcut(); },
    },
    data() {
        return {
            shortcuts: JSON.parse(JSON.stringify(shortcuts)),
            cclass: '',
            shortcut: '',
        }
    },
    computed: {
        classToShortcut() {
            return mapInvert(this.shortcuts);
        },
        shortcutList() {
            return Object.keys(this.shortcuts)
                .map(shortcut => [shortcut, this.shortcuts[shortcut]]);
        }
    },
    methods: {
        updateShortcuts() {
            this.deleteClassShortcut();            
            this.shortcuts[this.shortcut] = this.cclass;
            this.save();
            this.reset();
            window.alert('shortcut added!');
        },
        deleteShortcut() {
            this.deleteClassShortcut();
            this.save();
            this.reset();
            window.alert('shortcut deleted!');
        },
        deleteClassShortcut() {
            const shortcut = this.classToShortcut[this.cclass];
            if (shortcut) {
                delete this.shortcuts[shortcut];
            }
        },
        save() {
            fs.write('src/tailwind-shortcuts.json', JSON.stringify(this.shortcuts));
        },
        reset() {
            this.cclass = '';
            this.shortcut = '';
        }
    }
}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
    <input ref="input" v-model="cclass" placeholder="class (without leading .)" class="mode-input mousetrap" />
    <input v-model="shortcut" placeholder="shortcut" class="mode-input mousetrap" />
    <p class="text-center uppercase text-sm font-semibold tracking-wider">shortcuts</p>
    <VPrompts :prompts="shortcutList" />
</div>
</template>