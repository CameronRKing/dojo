<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import fs from '@/fs-client';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/base16-dark.css';

export default {
    components: {
        codemirror,
    },
    data() {
        return {
            file: '',
            currPath: '',
            cmOptions: {
                tabSize: 4,
                mode: 'test/javascript',
                theme: 'base16-dark',
                lineNumbers: true,
                line: true,
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
    <codemirror v-model="file" :options="cmOptions"></codemirror>
</template>