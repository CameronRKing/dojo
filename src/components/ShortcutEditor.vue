<script>
import KeyValue from '@/components/KeyValue.vue';

function remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx == -1) return;
    arr.splice(idx, 1);
}

export default {
    components: {
        KeyValue
    },
    props: ['shortcuts'],
    data() {
        return {
            shortcutUnderEdit: null,
            recording: false,
        };
    },
    methods: {
        remove,
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
            this.$nextTick(() => this.$refs.recordingInput[0].focus());
        },
        finishEditing() {
            this.shortcutUnderEdit.tags = this.shortcutUnderEdit.tags.filter(str => str != '');
            this.shortcutUnderEdit = null;
        }
    }
};
</script>

<template>
<div>
    <table>
        <tr
            v-for="item in shortcuts"
            :key="item.action"
        >
            <td>
                <template v-if="item == shortcutUnderEdit">
                    <input
                        type="text"
                        data-cy="edit-shortcut-prompt"
                        placeholder="prompt"
                        v-model="shortcutUnderEdit.prompt"
                    />
                </template>
                <template v-else>{{ item.prompt }}</template>
            </td>
            <td class="font-bold">
                {{ item.action }}
                <template v-if="item == shortcutUnderEdit">
                    <button @click="startRecording" v-if="!recording">Record action</button>
                    <template v-if="recording">
                        <input
                            ref="recordingInput"
                            data-cy="edit-shortcut-action"
                            class="opacity-0 absolute"
                        />
                        <span class="text-gray-800">Type, then wait 1 second</span>
                    </template>
                </template>
            </td>
            <td>
                <template v-if="item == shortcutUnderEdit">
                    <input
                        type="text"
                        data-cy="edit-shortcut-tags"
                        placeholder="tags"
                        :value="shortcutUnderEdit.tags.join(' ')"
                        @input="(e) => shortcutUnderEdit.tags = e.target.value.split(' ')"
                    />
                    <button @click="finishEditing">Finish editing</button>        
                </template>
                <template v-else>{{ item.tags.join(' ') }}</template>
            </td>
            <td @click="shortcutUnderEdit = item"><button>Edit</button></td>
            <td @click="remove(shortcuts, item)"><button>Delete</button></td>
        </tr>
    </table>
    <button @click="addShortcut">Add new shortcut</button>
    <button @click="$emit('done')">Done</button>
</div>
</template>