<script>
export default {
    props: ['value'],
    methods: {
        toggle() {
            this.$emit('input', !this.value);
        }
    },
    path: __filename
};
</script>



<template>
    <span @click="toggle" class="adjustable" >{{ value ? 'Do' : "Don't" }}</span>
</template>