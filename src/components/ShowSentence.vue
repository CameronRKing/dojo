<script>
import AdjustableNumber from './AdjustableNumber';
import DoClause from './DoClause';
export default {
    components: {
        AdjustableNumber,
        DoClause,
    },
    props: {
        options: {
            default: () => ({
                show: true,
                type: 'time',
                threshold: 1,
            })
        }
    },
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
    },
    path: __filename
};
</script>



<template>
<div style="display: flex; justify-content: flex-start; align-items: flex-start;">
    <DoClause data-cy="should-show" v-model="options.show" />
    <span>&nbsp;show answer&nbsp;</span>
    <!-- Ideally I'd like this to be some kind of select component, but it seems like more trouble than it's worth right now -->
    <span v-if="options.show" data-cy="show-options">
        <span v-if="options.type == 'guesses'" class="adjustable" @click="chooseShowType">after <AdjustableNumber v-model="options.threshold" singular="guess" plural="guesses" /></span>
        <span v-if="options.type == 'time'" class="adjustable" @click="chooseShowType">after <AdjustableNumber v-model="options.threshold" singular="second" plural="seconds" /></span>
        <span v-if="options.type == 'always'" class="adjustable" @click="chooseShowType">always</span>
        <span v-if="showOptions">
            <span v-show="options.type != 'guesses'" @click="choose('guesses')"><br />after <b>{{ options.threshold }}</b> {{ plurify('guess', 'es') }}</span>
            <span v-show="options.type != 'time'" @click="choose('time')"><br />after <b>{{ options.threshold }}</b> {{ plurify('second', 's') }}</span>
            <span v-show="options.type != 'always'" @click="choose('always')"><br />always</span>
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
    user-select: none;
}
</style>