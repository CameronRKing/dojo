<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/base16-dark.css';

export default {
    props: ['value', 'path'],
    components: {
        codemirror,
    },
    data() {
        return {
            cmOptions: {
                tabSize: 4,
                mode: 'test/javascript',
                theme: 'base16-dark',
                lineNumbers: true,
                line: true,
                keyMap: 'sublime',
                extraKeys: {
                    'Ctrl-S': () => this.save(),
                    'Ctrl-P': () => this.$emit('open', 'src/test/App.vue'),
                    // some Chrome shortcuts can be overridden, but not all
                    // Ctrl-N & Ctrl-T are inviolable
                    'Alt-N': () => this.$emit('new-tab'),
                    'Shift-Alt-N': () => this.$emit('kill-tab'),
                    'Shift-Alt-2': () => this.$emit('new-pane'),
                    'Shift-Alt-1': () => this.$emit('kill-pane'),
                }
            }
        }
    },
    methods: {
        save() {
            let path = this.path;
            if (!path) {
                path = window.prompt('Enter a path relative to the source directory:');
            }
            this.$emit('save', path);
        }
    }
}
</script>



<template>
    <codemirror class="h-full"
        :value="value"
        @input="e => $emit('input', e)"
        :options="cmOptions"
    ></codemirror>
</template>



<style lang="postcss">
.CodeMirror {
    @apply h-full
}
</style>