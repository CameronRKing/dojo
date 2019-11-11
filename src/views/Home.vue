<template>
  <div class="home">
    <textarea v-model="template"></textarea>

    <div style="border: 1px solid black" ref="view"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from 'vue';
import MyButton from '@/components/MyButton'

export default {
    data() {
        return {
            template: '<div>Change me!</div>',
            cmpData: {},
            cmpProps: {},
            compiled: false,
            cmpMethods: {
                testMe() { this.log() },
                log() { console.log('yeah baby!'); }
            }
        }
    },
    created() {
        this.compileCmp();
    },
    watch: {
        ...['template', 'cmpData', 'cmpProps'].reduce((watchers, key) => 
            ({ ...watchers, [key]: function(oldVal, newVal) {
                console.log('updating ' + key);
                this.compileCmp();
            }
        })
        , {})
    },
    methods: {
        addProp(name) {
            this.cmp.props[name] = { type: null };
        },
        addData(name, val) {
            cmpData[name] = val;
        },
        compileCmp() {
            const data = JSON.parse(JSON.stringify(this.cmpData));
            if (this.vm) {
                this.vm.$destroy();
                const node = this.$refs.view;
                node.removeChild(node.childNodes[0]);
            }

            this.vm = new Vue({
                components: {
                    'tmp-cmp': {
                        props: this.cmpProps,
                        data() { return data; },
                        template: this.template,
                        methods: this.cmpMethods,
                    }
                },
                template: '<tmp-cmp />',
            }).$mount();
            this.$refs.view.appendChild(this.vm.$el);
            this.compiled = true;
        }
    }
}
</script>
