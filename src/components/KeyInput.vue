<script>
import KeySequenceChecker from '../KeySequenceChecker';

export default {
    props: ['expected', 'prompt'],
    data() {
        return {
            checker: null,
        }
    },
    mounted() {
        this.checker = new KeySequenceChecker(this.$refs.input, this.expected, {
            success: ()  => this.$emit('success'),
            failure: (actual) => this.$emit('failure', actual)
        });
    },
    watch: {
        expected(val, oldVal) {
            this.checker.setSequence(val);
        }
    },
}
</script>



<template>
    <input
        style="height: 10px; width: 100px"
        ref="input"
        data-cy="key-input"
        :placeholder="prompt"
        @input="(e) => e.target.value = ''"
    />
</template>