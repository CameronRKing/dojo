import Mousetrap from 'mousetrap';

export default {
    components: {
        VPrompts: {
            props: ['prompts'],
            template: `<table class="text-gray-700 mx-auto whitespace-no-wrap">
            <tr v-for="[key, action] in prompts">
                <td class="text-right text-gray-900">{{ key }}:</td>
                <td class="text-left">&nbsp;{{ action }}</td>
            </tr>
        </table>`
        }
    },
    data() {
        return {
            prompts: [],
            bindings: [],
            userInput: '',
        }
    },
    created() {
        this.prompts = this.$options.prompts;
        this.bindings = this.$options.bindings;
    },
    mounted() {
        if (this.$refs.input) this.$refs.input.focus();
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
        newMode(mode, args) {
            this.$emit('new-mode', { mode, args });
        },
        prevMode() {
            this.$emit('old-mode');
        },
        teardown(args) {
            if (this.$options.teardown) {
                this.$options.teardown.call(this, args);
            }
        }
    }
};
