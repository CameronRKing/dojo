<script>
import KeyValue from './KeyValue.vue';
import KeyTrainer from './KeyTrainer.vue';
import Mousetrap from 'mousetrap';
import 'mousetrap/plugins/record/mousetrap-record';

function remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == -1) return;
    arr.splice(idx, 1);
}

export default {
    components: {
        KeyTrainer,
        KeyValue
    },
    data() {
        return {
            shortcuts: [],
            toTrain: null,
            cheatsheet: null,
            editing: false,
            shortcutUnderEdit: null,
            recording: null,
            tags: null
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
        remove,
        train(tag, shortcuts) {
            this.toTrain = shortcuts;
        },
        showCheatsheet(shortcuts) {
            this.cheatsheet = shortcuts;
        },
        edit() {
            this.editing = true;
        },
        addShortcut() {
            this.shortcutUnderEdit = {
                prompt: '',
                action: '',
                tags: [],
            };
            this.shortcuts.push(this.shortcutUnderEdit);
        },
        startRecording() {
            this.recording = true;
            Mousetrap.record((sequence) => {
                this.shortcutUnderEdit.action = sequence.join(' ');
                this.recording = false;
            });
            this.$nextTick(() => this.$refs.recordingInput.focus());
        },
        finishEditing() {
            this.shortcutUnderEdit = null;
        }
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
        <button @click="edit">Edit master list</button>
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
    
    <KeyTrainer
        v-if="toTrain"
        :to-train="toTrain"
        @done="toTrain = null"
     />

    <div v-if="editing">
        <table>
            <tr v-for="item in shortcuts" :key="item.action">
                <td>{{ item.prompt }}</td>
                <td class="font-bold">{{ item.action }}</td>
                <td>{{ item.tags.join(' ') }}</td>
                <td @click="shortcutUnderEdit = item"><button>Edit</button></td>
                <td @click="remove(shortcuts, item)"><button>Delete</button></td>
            </tr>
        </table>
        <KeyValue
            align="left"
            value-style="font-bold action"
            :items="shortcuts.map(({ prompt, action }) => [prompt, action])"
        />
        <button @click="addShortcut">Add new shortcut</button>
        <div v-if="shortcutUnderEdit">
            <input
                type="text"
                class="mousetrap"
                data-cy="edit-shortcut-prompt"
                placeholder="prompt"
                v-model="shortcutUnderEdit.prompt"
             />
            <div>Action: '{{ shortcutUnderEdit.action }}'</div>
            <button @click="startRecording">Record action</button>
            <div v-if="recording">
                <input
                    ref="recordingInput"
                    data-cy="edit-shortcut-action"
                    class="opacity-0"
                 />
                <span class="text-gray-800">Recording will finish automatically 1 second after you finish typing</span>
            </div>
            <input
                type="text"
                data-cy="edit-shortcut-tags"
                placeholder="tags"
                :value="shortcutUnderEdit.tags.join(' ')"
                @input="(e) => shortcutUnderEdit.tags = e.target.value.split(' ')"
             />
            <button @click="finishEditing">Finish editing</button>
        </div>
        <button @click="editing = false">Done</button>
    </div>
</div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;
</style>