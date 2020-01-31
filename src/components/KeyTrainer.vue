<script>
import CenterAlign from '@/components/CenterAlign.vue';
import KeyInput from './KeyInput';
import ShowSentence from './ShowSentence';
import ProgressBar from './ProgressBar';

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
            missedQuestion: false,
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
                this.setNextSequenceToTrain();
            } else {
                this.shortcut = null;
            }
        },
        secondsPassed() {
            return (Date.now() - this.startTime) / 1000;
        },
        setNextSequenceToTrain() {
            this.startTime = Date.now();
            this.shortcut = this.toTrain.filter(item => !this.completed.includes(item))[0];
        },
        alertSuccess() {
            this.completed.push(this.shortcut);
            this.setNextSequenceToTrain();
            this.message = 'correct!';
        },
        alertFailure(msg) {
            console.log('alerting failure', msg);
            this.missedQuestion = true;
            this.errors.push(this.shortcut);
            this.message = msg;
            this.$nextTick(() => this.$refs.moveOnInput.focus());
        },
        moveOn() {
            this.missedQuestion = false;
            this.message = '';
            this.setNextSequenceToTrain();
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
    </div>

    <div v-if="shortcut" class="flex flex-col justify-start items-center">
        <h2 data-cy="action-label">{{ shortcut.prompt }}</h2>
        <KeyInput
            ref="keyInput"
            :expected="shortcut.action"
            @success="alertSuccess"
            @failure="alertFailure"
         />

        <div v-if="!missedQuestion">{{ message }}</div>
        <div v-if="missedQuestion" @keydown="moveOn">
            <CenterAlign valueStyle="font-bold" :items="[
                'You pressed:', message,
                'Correct answer:', shortcut.action
            ]" />
            <i class="text-gray-700">Press any key to continue</i>
            <br />
            <input class="opacity-0" ref="moveOnInput" data-cy="move-on-input" />
        </div>
    </div>

</div>
</div></template>

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