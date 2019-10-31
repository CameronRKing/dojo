<script>
import AdjustableNumber from './AdjustableNumber';

export default {
    components: {
        AdjustableNumber,
    },
    props: ['options'],
    data() {
        return {
            showOptions: false,
        };
    },
    methods: {
        toggleShow() {
            this.options.show = !this.options.show;
        },
        chooseShowType() {
            this.showOptions = true;
        },
        plurify(word, ending) {
            if (this.options.threshold > 1) {
                return word + ending;
            }
            return word;
        },
        choose(type) {
            this.options.type = type;
            this.showOptions = false;
        }
    }
}
</script>



<template>
<div style="display: flex; justify-content: flex-start; align-items: flex-start;">
    <span @click="toggleShow" class="adjustable" data-cy="should-show">{{ options.show ? 'Do' : "Don't" }}</span>
    <span>&nbsp;show answer&nbsp;</span>
    <span v-if="options.show" data-cy="show-options">
        <span v-if="options.type == 'always'" class="adjustable" @click="chooseShowType">always</span>
        <span v-if="options.type == 'guesses'" class="adjustable" @click="chooseShowType">after <AdjustableNumber v-model="options.threshold" singular="guess" plural="guesses" /></span>
        <span v-if="options.type == 'time'" class="adjustable" @click="chooseShowType">after <AdjustableNumber v-model="options.threshold" singular="second" plural="seconds" /></span>
        <span v-if="showOptions">
            <br /><span @click="choose('always')">always</span>
            <br /><span @click="choose('guesses')">after <b>{{ options.threshold }}</b> {{ plurify('guess', 'es') }}</span>
            <br /><span @click="choose('time')">after <b>{{ options.threshold }}</b> {{ plurify('second', 's') }}</span>
        </span>
    </span>

</div>
</template>

<style>
.adjustable {
    color: darkblue;
    text-decoration: underline;
    cursor: pointer;
    position: relative;
}
</style>