<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/base16-dark.css';
import Mousetrap from 'mousetrap';
import FileQuickOpen from '@/components/FileQuickOpen';

export default {
    components: {
        codemirror,
        FileQuickOpen,
    },
    props: ['value', 'path'],
    data() {
        return {
            cm: null,
            opening: false,
            cmOptions: {
                tabSize: 4,
                autofocus: true,
                mode: 'test/javascript',
                theme: 'base16-dark',
                lineNumbers: true,
                line: true,
                keyMap: 'sublime',
                extraKeys: {
                    'Ctrl-S': () => this.save(),
                    'Ctrl-P': () => this.opening = true,
                    // some Chrome shortcuts can be overridden, but not all
                    // Ctrl-N & Ctrl-T are inviolable
                    'Alt-N': () => this.$emit('new-tab'),
                    'Alt-]': () => this.$emit('select-tab-right'),
                    'Alt-[': () => this.$emit('select-tab-left'),
                    'Shift-Alt-]': () => this.$emit('move-tab-right'),
                    'Shift-Alt-[': () => this.$emit('move-tab-left'),
                    'Shift-Ctrl-]': () => this.$emit('select-pane-right'),
                    'Shift-Ctrl-[': () => this.$emit('select-pane-left'),
                    'Shift-Alt-N': () => this.$emit('kill-tab'),
                    'Shift-Alt-2': () => this.$emit('new-pane'),
                    'Shift-Alt-1': () => this.$emit('kill-pane'),
                }
            }
        }
    },
    methods: {
        focus() {
            // it's not the best practice to hit an internal this way,
            // but it's more terse than saving the instance from the ready event
            this.$refs.editor.cminstance.focus();
        },
        save() {
            let path = this.path;
            if (!path) {
                path = window.prompt('Enter a path relative to the source directory:');
            }
            this.$emit('save', path);
        },
        open(path) {
            this.opening = false;
            this.$emit('open', path);
        }
    }
}
</script>



<template>
<div class="h-full">
    <FileQuickOpen v-if="opening" @open="open" @close="opening = false" />
    <codemirror class="h-full"
        ref="editor"
        :value="value"
        @input="e => $emit('input', e)"
        :options="cmOptions"
        @focus="$emit('focus')"
    ></codemirror>
</div>
</template>



<style lang="postcss">
.CodeMirror {
    @apply h-full
}
</style>