<script>
import KeyInput from './KeyInput';

export default {
    components: {
        KeyInput,
    },
    data() {
        return {
            item: {
                sequence: '',
                action: 'Do a thing',
            },
            message: '',
        };
    },
    methods: {
        alertSuccess() {
            this.message = 'correct!';
        },
        alertFailure(msg) {
            this.message = msg;
        },
    }
}
</script>



<template>
<div>
    <h2>{{ item.action }}</h2>
    <KeyInput :expected="item.sequence"
        @success="alertSuccess"
        @failure="alertFailure" />

    <span>{{ message }}</span>
</div>
</template>