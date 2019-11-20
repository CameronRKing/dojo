<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime.js';
import fs from '@/fs-client';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/base16-dark.css';

export default {
    props: ['value'],
    components: {
        codemirror,
    },
    data() {
        return {
            currPath: '',
            cmOptions: {
                tabSize: 4,
                mode: 'test/javascript',
                theme: 'base16-dark',
                lineNumbers: true,
                line: true,
                keyMap: 'sublime',
                extraKeys: {
                    'Ctrl-S': () => this.$emit('save'),
                    'Ctrl-P': () => this.$emit('open'),
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
        getFile(path) {
            this.currPath = path;
            return fs.read(path).then(file => this.file = file);
        },
        setFile() {
            return fs.write([this.currPath, this.file]);
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