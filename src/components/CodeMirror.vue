<script>
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/vue/vue.js';
import 'codemirror/theme/base16-dark.css';
import Mousetrap from 'mousetrap';
import FileQuickOpen from '@/components/FileQuickOpen';
import { pairs } from '@/utils.js';

export default {
    components: {
        FileQuickOpen,
    },
    props: ['value', 'path'],
    data() {
        return {
            cm: null,
            opening: false,
        }
    },
    mounted() {
        this.initialize();
    },
    destroyed() {
        this.cm.doc.cm.getWrapperElement().remove();
    },
    computed: {
        mode() {
            if (!this.path) return 'text/javascript';
            if (this.path.endsWith('.js')) return 'text/javascript';
            if (this.path.endsWith('.vue')) return 'text/x-vue';
        },
        cmOptions() {
            return {
                indentUnit: 4,
                autofocus: true,
                mode: this.mode,
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
                    'Alt-`': () => this.$emit('focus-ast'),
                }
            }
        }
    },
    watch: {
        value(newVal) {
            if (newVal !== this.cm.getValue()) {
                // if we don't rescroll to where we were,
                // it moves the cursor to the beginning of the doc
                const { left, top } = this.cm.getScrollInfo();
                this.cm.setValue(newVal);
                this.cm.scrollTo(left, top);
            }
        },
        cmOptions(newVal) {
            pairs(newVal).forEach(([key, val]) => this.cm.setOption(key, val));
        }
    },
    methods: {
        initialize() {
            this.cm = CodeMirror.fromTextArea(
                this.$refs.textarea,
                this.cmOptions
            );
            this.cm.setValue(this.value);
            this.cm.on('change', (cm, { from, to, text, removed, origin }) => {
                const value = cm.getValue();
                this.$emit('input', value);
                this.$emit('change', { path: this.path, content: value });
            });
            this.refresh();
        },
        refresh() {
            this.$nextTick(() => this.cm.refresh());
        },
        focus() {
            this.cm.focus();
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
    <textarea class="h-full" ref="textarea" name="codemirror"></textarea>
</div>
</template>



<style lang="postcss">
.CodeMirror {
    @apply h-full
}
</style>