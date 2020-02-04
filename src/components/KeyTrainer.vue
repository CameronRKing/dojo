<script>
import KeyValue from '@/components/KeyValue.vue';
import KeyInput from './KeyInput';
import ShowSentence from './ShowSentence';
import ProgressBar from './ProgressBar';

function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function leftPad(num, totalWidth) {
    const str = String(num);
    if (str.length < totalWidth) {
        return '0'.repeat(totalWidth - str.length) + str;
    }
    return str;
}

export default {
    props: ['toTrain'],
    components: {
        KeyInput,
        ShowSentence,
        ProgressBar,
        KeyValue
    },
    data() {
        return {
            shortcut: null,
            message: '',
            completed: [],
            startTime: null,
            justMissed: false,
            currRound: 1,
            sessionEnded: false,
            attempts: 0,
            misses: 0
        };
    },
    created() {
        this.initialize();
    },
    mounted() {
        if (this.$refs.keyInput) this.$refs.keyInput.focus();
    },
    watch: {
        toTrain(val, oldVal) {
            this.initialize()
        }
    },
    methods: {
        initialize() {
            this.startTime = Date.now();
            if (this.toTrain.length) {
                this.setNextShortcutToTrain();
            } else {
                this.shortcut = null;
            }
        },
        secondsPassed() {
            return (Date.now() - this.startTime) / 1000;
        },
        setNextShortcutToTrain() {
            if (this.completed.length == this.toTrain.length) {
                this.completed.splice(0, this.completed.length);
                this.currRound++;
            }
            
            const possibleChoices = this.toTrain.filter(item => !this.completed.includes(item));
            const newItem = randItem(possibleChoices);

            if (this.shortcut == newItem) {
                this.$refs.keyInput.reset();
            } else {
                this.shortcut = newItem;
            }
        },
        alertSuccess() {
            this.attempts++;
            this.completed.push(this.shortcut);
            this.setNextShortcutToTrain();
            this.message = 'correct!';
        },
        alertFailure(msg) {
            this.attempts++;
            this.misses++;
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
    computed: {
        accuracy() {
            return Math.floor((this.attempts - this.misses) / this.attempts * 100) + '%';
        },
        timePassed() {
            const totalSeconds = Math.floor(this.secondsPassed());
            const minutes = Math.floor(totalSeconds / 60);
            return `${minutes}:${leftPad(totalSeconds % 60, 2)}`;
        }
    },
};
</script>



<template>
<div class="flex flex-col justify-start items-center m-auto max-w-2xl">
    <ProgressBar :progress="completed.length / toTrain.length" />
    <div class="flex justify-between w-full">
        <div>{{ completed.length }}/{{ toTrain.length }}</div>
        <div>Round: {{ currRound }}</div>
    </div>

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
        <KeyValue
            align="between"
            value-style="font-bold"
            :items="[
            'Shortcuts trained', toTrain.length,
            'Rounds', currRound - 1,
            'Total attempts', attempts,
            'Accuracy', accuracy,
            'Length', timePassed
        ]"
         />
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