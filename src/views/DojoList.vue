<script>
export default {
    data() {
        return {
            dojos: [],
        };
    },
    methods: {
        loadDojos() {
            this.$store.state.dojoRepo.all().then(dojos => this.dojos = dojos);
        },
    },
    created() {
        this.loadDojos();
    },
};
</script>

<template>
<div>
    <div
        v-for="dojo in dojos"
        :key="dojo.name"
        data-cy="dojo-name"
    >
        <router-link @click="$store.commit('setDojo', dojo)" :to="'/dojos/' + dojo.id">{{ dojo.name }}</router-link>
    </div>
</div>
</template>