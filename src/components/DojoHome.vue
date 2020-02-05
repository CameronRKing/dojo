<script>
import DojoTrain from '@/components/dojo/Train';
import ShortcutEditor from '@/components/ShortcutEditor.vue';
import KeyValue from './KeyValue.vue';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/record/mousetrap-record';

export default {
    components: {
        KeyValue,
        ShortcutEditor,
        DojoTrain
    },
    data() {
        return {
            shortcuts: [],
            toTrain: null,
            cheatsheet: null,
            editing: false,
        };
    },
    computed: {
        byTag() {
            return this.shortcuts.reduce((acc, shortcut) => {
                shortcut.tags.forEach(tag => {
                    if (!acc[tag]) acc[tag] = [];
                    acc[tag].push(shortcut);
                });
                return acc;
            }, {});
        }
    },
    methods: {
        train(tag, shortcuts) {
            this.toTrain = shortcuts;
        },
        showCheatsheet(shortcuts) {
            this.cheatsheet = shortcuts;
        },
    }
};
</script>

<template>
<div>
    <div
        v-if="!toTrain"
        class="flex flex-col items-center justify-center"
    >
        <button @click="showCheatsheet(shortcuts)">Master cheatsheet</button>
        <button @click="editing = true">Edit master list</button>
        <div
            v-for="(shortcuts, tag) in byTag"
            :key="tag"
            class="flex flex-col items-start justify-start mt-4"
        >
            <div class="capitalize text-xl">{{ tag }}</div>
            <div class="uppercase text-sm tracking-wider font-bold">{{ shortcuts.length }} shortcuts</div>
            <button @click="showCheatsheet(shortcuts)">Cheatsheet</button>
            <button @click="train(tag, shortcuts)">Train</button>
        </div>
    </div>

    <!-- should probably turn this into a modal at some point -->
    <div v-if="cheatsheet">
        <KeyValue
            align="left"
            value-style="font-bold action"
            :items="cheatsheet.map(({ prompt, action }) => [prompt, action])"
         />
        <button @click="cheatsheet = null">Close</button>
    </div>
    
    <DojoTrain
        v-if="toTrain"
        :to-train="toTrain"
        @done="toTrain = null"
     />

    <ShortcutEditor
        v-if="editing"
        :shortcuts="shortcuts"
        @done="editing = false"
     />
</div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;
</style>