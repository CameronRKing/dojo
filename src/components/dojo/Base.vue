<script>
import ProgressBar from '@/components/ProgressBar';
import KeyInput from '@/components/KeyInput';
import KeyValue from '@/components/KeyValue.vue';

export default {
    components: {
        ProgressBar,
        KeyInput,
        KeyValue
    },
    props: ['shortcutProvider'],
    data() {
        return {
            shortcut: null,
            message: '',
            startTime: null,
            justMissed: false,
            sessionEnded: false,
        };
    },
    watch: {
        shortcutProvider(val, oldVal) {
            this.initialize();
        },
    },
    mounted() {
        if (this.$refs.keyInput) this.$refs.keyInput.focus();
    },
    methods: {
        initialize() {
            if (this.shortcutProvider) {
                this.setNextShortcutToTrain();
            } else {
                this.shortcut = null;
            }
        },
        setNextShortcutToTrain() {
            const newItem = this.shortcutProvider.getNext();
            if (this.shortcut == newItem) {
                this.$refs.keyInput.reset();
            } else {
                this.shortcut = newItem;
            }
        },
        alertSuccess() {
            this.shortcutProvider.success(this.shortcut);
            this.setNextShortcutToTrain();
            this.message = 'correct!';
        },
        alertFailure(msg) {
            this.shortcutProvider.failure(this.shortcut);
            this.justMissed = this.shortcut;
            this.message = msg;
            this.$nextTick(() => this.$refs.moveOnInput.focus());
        },
        moveOn() {
            this.message = '';
            this.setNextShortcutToTrain();
            this.justMissed = null;
            this.$refs.keyInput.focus();
        },
        endSession() {
            this.sessionEnded = true;
        },
        leaveSession() {
            this.$emit('done')
        }
    },
    created() {
        this.initialize();
    },
};
</script>



<template>
<div class="flex flex-col justify-start items-center m-auto max-w-2xl">
    <ProgressBar :progress="shortcutProvider.progress" />
    <slot name="progress"></slot>

    <div
        v-if="shortcut && !sessionEnded"
        class="flex flex-col justify-start items-center"
        data-cy="trainer"
    >
        <h2 data-cy="action-label">{{ shortcut.prompt }}</h2>
        <KeyInput
            ref="keyInput"
            :expected="shortcut.action"
            @success="alertSuccess"
            @failure="alertFailure"
         />

        <div v-if="!justMissed">{{ message }}</div>
        <div
            v-if="justMissed"
            @keydown="moveOn"
        >
            <KeyValue
                align="center"
                value-style="font-bold"
                :items="[
                'You pressed:', message,
                'Correct answer:', shortcut.action
            ]"
             />
            <i class="text-gray-700">Press any key to continue</i>
            <br />
            <input
                class="opacity-0"
                ref="moveOnInput"
                data-cy="move-on-input"
             />
        </div>
        <button @click="endSession">End session</button>
    </div>

    <div
        v-if="sessionEnded"
        class="flex flex-col"
    >
        <slot name="session-recap"></slot>

        <button
            @click="leaveSession"
            class="border mt-2"
        >Return to dojo</button>
    </div>

</div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;
</style>