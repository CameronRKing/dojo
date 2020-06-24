<script>
import FirebaseAuth from '@/components/FirebaseAuth.vue';

export default {
    components: {
        FirebaseAuth
    },
    data() {
        return {
            show: false
        };
    },
    methods: {
        open() {
            this.show = true;
        }
    }
}
</script>



<template>
<div :class="{hidden: !show}">
    <h2>Log in or sign up to save your progress.</h2>
    <FirebaseAuth @signed-in="show = false; $emit('signed-in')" />
</div>
</template>