<script>
export default {
    props: ['component'],
    watch: {
        component: {
            handler(newVal, oldVal) {
                this.updateMount();
            }
        }
    },
    mounted() {
        this.updateMount();
    },
    methods: {
        async updateMount() {
            if (this.$refs.mountPoint.lastChild) {
                this.$refs.mountPoint.removeChild(this.$refs.mountPoint.lastChild);
            }

            if (this.component) {
                window.vm = this.component.vm;
                this.$refs.mountPoint.appendChild(this.component.vm.$el);
            }
        }
    }
}
</script>



<template>
<div ref="mountPoint"></div>
</template>