<script>
import Mousetrap from 'mousetrap';

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
        Mousetrap.bind('down', () => {
            if (this.highlighted < this.results.length - 1) this.highlighted++;
        });
        Mousetrap.bind('up', () => {
            if (this.highlighted > 0) this.highlighted--;
        });
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
        name(filePath) {
            return filePath.split('\\').slice(-1)[0];
        }
    }
}
</script>



<template>
<div class="bg-gray-200">
    <input class="w-full m-1 mousetrap"
        v-model="searchStr"
        ref="input"
        @keydown.enter="$emit('open', results[highlighted])"
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
    </ul>
</div>
</template>