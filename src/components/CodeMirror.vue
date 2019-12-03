<script>
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/keymap/sublime.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/vue/vue.js';
import 'codemirror/theme/base16-dark.css';
import Mousetrap from 'mousetrap';
import { pairs } from '@/utils.js';
import fs from '@/fs-client.js';
import FileSearch from '@/components/FileSearch';
import { vue as VUE_BOILERPLATE} from '@/boilerplate.js';
import TestingPanel from '@/components/testing/TestingPanel';

function wordAtCursor(cm) {
    const doc = cm.getDoc();
    const { line, ch } = doc.getCursor();
    const { anchor, head } = cm.findWordAt({ line, ch });
    return doc.getRange(anchor, head);
}

export default {
    components: {
        FileSearch,
        TestingPanel,
    },
    props: ['value', 'path'],
    data() {
        return {
            cm: null,
            opening: false,
            importing: false,
            files: [],
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
                    'F1': async () => {
                        const vueFiles = await fs.vueFilesIn('.');
                        const word = wordAtCursor(this.cm);
                        const matches = vueFiles.filter(f => f.match(word));
                        if (matches.length == 1)
                            this.$emit('import-component', matches[0].replace('src', '@'));
                        else {
                            this.files = vueFiles;
                            this.importing = true;
                            this.$nextTick(() => this.$refs.search.setSearch(word));
                        }
                    },
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
                    'Ctrl-R': () => this.runTests(),
                    'Alt-R': () => this.focusTests(),
                }
            }
        },
        searching: {
            get() {
                return this.opening || this.importing;
            },
            set(val) {
                this.opening = this.importing = val;
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
        async opening(newVal) {
            if (newVal)
                this.files = await fs.srcFiles();
            else 
                this.files = [];
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
            if (this.opening) {
                this.opening = false;
                this.$emit('open', path);
            } else if (this.importing) {
                this.importing = false;
                this.$emit('import-component', path);
            }
        },
        async handleCreate(path) {
            const createAndOpen = async () => {
                let starter = '';
                if (path.endsWith('.vue')) starter = VUE_BOILERPLATE;
                await fs.write(path, starter);
                this.$emit('open', path);
            }
            if (this.opening) {
                this.opening = false;
                createAndOpen();
            } else if (this.importing) {
                this.importing = false;
                this.$emit('import-component', path);
                createAndOpen();
            }
        },
        runTests() {
            this.$refs.tests.run();
        },
        focusTests() {
            this.$refs.tests.focus();
        }
    }
}
</script>



<template>
<div class="h-full">
    <FileSearch v-if="searching"
        ref="search"
        :files="files"
        @open="open"
        @close="searching = false"
        @create="handleCreate"
    />
    <textarea class="h-full" ref="textarea" name="codemirror"></textarea>

    <TestingPanel v-if="path && (path.endsWith('.js') || path.endsWith('.vue'))"
        :path="path"
        ref="tests"
        @blur="focus"
        @open="path => this.$emit('open', path)"
    />
</div>
</template>



<style lang="postcss">
.CodeMirror {
    @apply h-full
}
</style>