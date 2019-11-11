export function story(cmp, props) {
    return {
        components: { cmp },
        template: '<cmp v-bind="cmpProps" />',
        data() {
            return {
                cmpProps: props
            };
        }
    }
}