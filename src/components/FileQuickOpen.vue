<script>
import fs from '@/fs-client.js';
import Mousetrap from 'mousetrap';

export default {
    data() {
        return {
            searchStr: '',
            availableFiles: [],
            highlighted: 0,
        }
    },
    async created() {
        this.availableFiles = await fs.srcFiles();
    },
    mounted() {
        this.$refs.input.focus();
        Mousetrap.bind('j', () => {
            if (this.highlighted < this.results.length - 1) this.highlighted++;
        });
        Mousetrap.bind('k', () => {
            if (this.highlighted > 0) this.highlighted--;
        });
    },
    unmounted() {
        Mousetrap.unbind('j');
        Mousetrap.unbind('k');
    },
    computed: {
        results() {
            const regex = new RegExp(this.searchStr, 'i');
            return this.availableFiles.filter(f => f.match(regex));
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
    <input class="w-full m-1" v-model="searchStr" ref="input" @keydown.enter="$emit('open', results[highlighted])" />
    <ul class="h-64 overflow-x-auto">
        <li v-for="(filePath, idx) in results" class="p-1" :class="{'bg-gray-400': idx == highlighted}">
            <div>{{ name(filePath) }}</div>
            <div class="text-xs text-gray-800">{{ filePath }}</div>
        </li>
    </ul>
</div>
</template>