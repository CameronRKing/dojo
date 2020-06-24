<script>
import FirebaseAuth from '@/components/FirebaseAuth.vue';

export default {
    components: {
        FirebaseAuth
    },
    watch: {
        '$store.state.user'(val) {
            if (val) this.$router.push('/dojos');
        }
    }
}
</script>



<template>
    <FirebaseAuth />
</template>