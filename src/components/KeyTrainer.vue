<script>
import CenterAlign from '@/components/CenterAlign.vue';
import KeyInput from './KeyInput';
import ShowSentence from './ShowSentence';
import ProgressBar from './ProgressBar';

function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default {
    components: {
        KeyInput,
        ShowSentence,
        ProgressBar,
        CenterAlign
    },
    data() {
        return {
            toTrain: [
                { prompt: 'Underline text', action: 'ctrl+u' },
                { prompt: 'Bold text', action: 'ctrl+b' },
            ],
            shortcut: null,
            message: '',
            completed: [],
            errors: [],
            startTime: null,
            justMissed: false,
            currRound: 1,
        };
    },
    created() {
        this.initialize();
    },
    watch: {
        toTrain(val, oldVal) {
            this.initialize()
        }
    },
    methods: {
        initialize() {
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
            this.startTime = Date.now();

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
            this.completed.push(this.shortcut);
            this.setNextShortcutToTrain();
            this.message = 'correct!';
        },
        alertFailure(msg) {
            this.justMissed = this.shortcut;
            this.message = msg;
            this.$nextTick(() => this.$refs.moveOnInput.focus());
        },
        moveOn() {
            this.message = '';
            this.setNextShortcutToTrain();
            this.justMissed = null;
            this.$refs.keyInput.focus();
        }
    }
}
</script>



<template>
<div class="flex flex-col justify-start items-center m-auto max-w-2xl">
    <ProgressBar :progress="completed.length / toTrain.length" />
    <div class="flex justify-between w-full">
        <div>{{ completed.length }}/{{ toTrain.length }}</div>
        <div>Round: {{ currRound }}</div>
    </div>

    <div
        v-if="shortcut"
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
            <CenterAlign
                valueStyle="font-bold"
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
    </div>

</div>
</template>

<style lang="postcss">
@tailwind base;

@tailwind components;

@tailwind utilities;

/* from animate.css, with modifications */
.animated {
    -webkit-animation-duration: 0.3s;
    animation-duration: 0.3s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
}

@-webkit-keyframes shake {
    from,
    to {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }

    20%,
    60% {
        -webkit-transform: translate3d(-4px, 0, 0);
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    80% {
        -webkit-transform: translate3d(4px, 0, 0);
        transform: translate3d(4px, 0, 0);
    }
}

@keyframes shake {
    from,
    to {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }

    20%,
    60% {
        -webkit-transform: translate3d(-4px, 0, 0);
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    80% {
        -webkit-transform: translate3d(4px, 0, 0);
        transform: translate3d(4px, 0, 0);
    }
}

.shake {
    -webkit-animation-name: shake;
    animation-name: shake;
}
</style>