<script>
import BaseMode from './BaseMode';

export default {
    mixins: [BaseMode],
    props: ['selection'],
    prompts: [
        ['tab', 'cancel'],
        ['up/down', 'change new parent element'],
        ['enter', 'append as child of selected'],
    ],
    bindings: {
        tab(e) { e.preventDefault(); this.$emit('old-mode'); },
        up() { this.selection.elList.moveCursorUp(); },
        down() { this.selection.elList.moveCursorDown(); },
        enter() { this.moveElement(); },
    },
    methods: {
        moveElement() {
            const newParent = this.selection.elList.getHighlighted().el;
            if (newParent == this.selection.el) {
                this.prevMode();
            }
            let node;
            this.selection.findByDataId(n => { node = n; return node});
            this.selection.delete();
            this.selection.ast.findByPaletteId(newParent.getAttribute('data-palette'), n => {
                n.content.push(node);
                return n;
            });
            this.selection.save();
            this.prevMode();
        }
    }
}
</script>



<template>
<div>
    <VPrompts v-bind="{ prompts }" />
</div>
</template>