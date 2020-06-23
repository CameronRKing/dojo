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
    }
};1
</script>

<template>
<div>
    <div
        v-for="dojo in dojos"
        :key="dojo.name"
        data-cy="dojo-name"
    >
        <router-link :to="'/dojos/' + dojo.id">{{ dojo.name }}</router-link>
    </div>
</div>
</template>