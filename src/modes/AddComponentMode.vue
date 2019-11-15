<script>
import BaseMode from './BaseMode.js';
import fs from '@/fs-client.js';

export default {
    mixins: [BaseMode],
    prompts: [
        ['tab', 'cancel'],
        ['enter', 'create component'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.prevMode(); },
        enter() { this.createComponent() },
    },
    data() {
        return {
            userInput: '',
        };
    },
    methods: {
        async createComponent() {
            await fs.createVueFile(`src/test/${this.userInput}.vue`);
            this.prevMode();
        }
    }
}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
    <input ref="input" v-model="userInput" placeholder="MyComponent" class="mode-input mousetrap" />
</div>
</template>