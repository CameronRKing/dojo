<script>
import KeyInput from './KeyInput';
import ShowSentence from './ShowSentence';
import ProgressBar from './ProgressBar';

export default {
    components: {
        KeyInput,
        ShowSentence,
        ProgressBar,
    },
    data() {
        return {
            toTrain: [
                { action: 'Underline text', sequence: 'ctrl+u' },
                { action: 'Bold text', sequence: 'ctrl+b' },
            ],
            item: null,
            message: '',
            completed: [],
            errors: [],
            animateClass: '',
            startTime: null,
            showOptions: {
                show: false,
                type: 'always',
                threshold: 1,
            },
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
    computed: {
        prompt() {
            if (!this.showOptions.show) return '';
            const shouldShow = {
                always: () => true,
                time: () => this.secondsPassed() >= this.showOptions.threshold,
                // grab the last X errors and show the answer if they're all 
                guesses: () => this.errors.slice(-this.showOptions.threshold).every(item => item == this.item)
            }[this.showOptions.type]();

            if (shouldShow) return this.item.sequence;
            return '';
        }
    },
    methods: {
        initialize() {
            if (this.toTrain.length) {
                this.setNextSequenceToTrain();
            } else {
                this.item = null;
            }
        },
        secondsPassed() {
            return (Date.now() - this.startTime) / 1000;
        },
        setNextSequenceToTrain() {
            this.startTime = Date.now();
            this.item = this.toTrain.filter(item => !this.completed.includes(item))[0];
        },
        alertSuccess() {
            this.completed.push(this.item);
            this.setNextSequenceToTrain();
            this.message = 'correct!';
        },
        alertFailure(msg) {
            this.errors.push(this.item);
            this.animateClass = 'shake';
            setTimeout(() => this.animateClass = '', 350);
            this.message = msg;
        },
    }
}
</script>



<template>
<div class="flex flex-col justify-start items-center m-auto max-w-2xl">
    <ProgressBar :progress="completed.length / toTrain.length" />
    <div class="h-1 w-full bg-green-200">
        <div data-cy="progress-bar" class="h-1 bg-green-400" :style="{width: completed.length / toTrain.length * 100 + '%'}"></div>
    </div>
    <div class="flex justify-between w-full">
        <div>{{ completed.length }}/{{ toTrain.length }}</div>
        <div>{{ errors.length }} errors</div>
    </div>

    <div v-if="item">
        <h2 data-cy="action-label" class="animated" :class="animateClass">{{ item.action }}</h2>
        <KeyInput :expected="item.sequence"
            :prompt="prompt"
            @success="alertSuccess"
            @failure="alertFailure"
        />
        <ShowSentence :options="showOptions" />

        <span>{{ message }}</span>
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