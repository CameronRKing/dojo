<script>
import Mousetrap from 'mousetrap';
import { nextIdx, prevIdx } from '@/utils.js';

export default {
    props: ['files'],
    data() {
        return {
            searchStr: '',
            highlighted: 0,
        }
    },
    mounted() {
        this.$refs.input.focus();
        Mousetrap.bind('down', () => this.highlighted = nextIdx(this.results, this.highlighted));
        Mousetrap.bind('up', () => this.highlighted = prevIdx(this.results, this.highlighted));
        Mousetrap.bind('esc', () => this.$emit('close'));
    },
    unmounted() {
        Mousetrap.unbind('j');
        Mousetrap.unbind('k');
    },
    computed: {
        results() {
            const regex = new RegExp(this.searchStr.replace(/\\/, '\\'), 'i');
            return this.files.filter(f => f.match(regex));
        }
    },
    methods: {
        setSearch(str) {
          	this.searchStr = str;  
        },
        name(filePath) {
            return filePath.split('\\').slice(-1)[0];
        },
        handleEnter() {
            if (this.results.length) {
                this.$emit('open', this.results[this.highlighted])
            } else {
                this.$emit('create', this.searchStr);
            }
        }
    }
}
</script>



<template>
<div class="bg-gray-200">
    <input class="w-full m-1 mousetrap"
        v-model="searchStr"
        ref="input"
        @keydown.enter="handleEnter"
        @keydown.escape="$emit('close')"
    />
    <ul class="h-64 overflow-x-auto">
        <li v-for="(filePath, idx) in results"
            class="p-1"
            :class="{'bg-gray-400': idx == highlighted}"
            @click="$emit('open', results[idx])"
        >
            <div>{{ name(filePath) }}</div>
            <div class="text-xs text-gray-800">{{ filePath }}</div>
        </li>
        <li v-if="results.length == 0">
            <div>Create "{{ searchStr }}"?</div>
            <div class="text-xs text-gray-800">[ press enter to create ]</div>
        </li>
    </ul>
</div>
</template>