import Mousetrap from 'mousetrap';

export default {
    data() {
        return {
            prompts: [],
            bindings: [],
        }
    },
    created() {
        this.prompts = this.$options.prompts;
        this.bindings = this.$options.bindings;
    },
    mounted() {
        Object.keys(this.bindings).forEach(shortcut => {
            Mousetrap.bind(shortcut, this.bindings[shortcut].bind(this))
        });
    },
    destroyed() {
        Object.keys(this.bindings).forEach(shortcut => {
            Mousetrap.unbind(shortcut);
        });
    },
    methods: {
        teardown(args) {
            if (this.$options.teardown) {
                this.$options.teardown.call(this, args);
            }
        }
    }
};
