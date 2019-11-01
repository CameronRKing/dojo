<script>
export default {
    props: ['value'],
    methods: {
        toggle() {
            this.$emit('input', !this.value);
        }
    }
}
</script>



<template>
    <span @click="toggle" class="adjustable" >{{ value ? 'Do' : "Don't" }}</span>
</template>