<script>
import BaseMode from './BaseMode';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'cancel'],
        ['enter', 'save'],
        ['alt+n', 'add text'],
        ['alt+d', 'delete selected text'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.prevMode(); },
        enter() { this.addTextChild(); },
        'alt+n'(e) { e.preventDefault(); this.content.push('change me'); },
        'alt+d'(e) { e.preventDefault(); this.content.splice(this.focusedIdx, 1); },
    },
    data() {
        return {
            content: [],
            focusedIdx: null,
        }
    },
    created() {
        window.el = this.selection.el;
        this.selection.findByDataId(node => {
            console.log(node.content);
            if (!node.content) node.content = [];
            console.log(node.content);
            this.content = node.content;
            return node;
        });
    },
    methods: {
        addTextChild() {
            this.selection.save();
            this.prevMode();
        },
    }
}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
    <template v-for="(node, idx) in content">
        <input v-if="typeof node == 'string'" @focus="focusedIdx = idx" v-model="content[idx]" class="mode-input mousetrap" />
    </template>
</div>
</template>