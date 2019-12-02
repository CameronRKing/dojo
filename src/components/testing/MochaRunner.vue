<script>
import { Mocha } from 'mocha';
import Runner from 'mocha/lib/runner.js';
import Suite from 'mocha/lib/suite.js';
import { onMount } from '@/../tests/unit/test-utils.js';

const constants = Runner.constants;
const {
    EVENT_FILE_PRE_REQUIRE,
    EVENT_FILE_POST_REQUIRE,
    EVENT_FILE_REQUIRE,
} = Suite.constants;

Mocha.prototype.loadFiles = function(fn) {
  var self = this;
  var suite = this.suite;
  this.files.forEach(function(file) {
    suite.emit(EVENT_FILE_PRE_REQUIRE, global, file, self);
    suite.emit(EVENT_FILE_REQUIRE, require('@/../tests/unit/' + file), file, self);
    suite.emit(EVENT_FILE_POST_REQUIRE, global, file, self);
  });
  fn && fn();
};

Mocha.unloadFile = function(file) {
  delete require.cache[require.resolve(`@/../tests/unit/${file}`)];
};


// now what I need to do is link rendered components to tests

export default {
    data() {
        return {
            mocha: null,
            runner: null,
            tests: [],
            toRender: {'can be mounted directly to the DOM': true},
        }
    },
    watch: {
        tests: {
            deep: true,
            handler(newVal) {
                const ref = test => this.$refs[test.title] && this.$refs[test.title][0];
                const mount = (context, tried=false) => {
                    if (!ref(context.test)) {
                        if (tried) throw new Error('unable to find mounting point for ' + context.test.title);
                        this.$nextTick(() => mount(context, true))
                    } else {
                        ref(context.test).appendChild(context.cmp.vm.$el);
                        context.mounted = true;
                    }
                }
                const unmount = (context) => {
                    const el = ref(context.test);
                    el.removeChild(el.lastChild);
                    context.mounted = false;
                }

                newVal.forEach(context => {
                    const { test, render, mounted } = context;
                    if (render && !mounted) {
                        mount(context);
                    } else if (!render && mounted) {
                        unmount(context);
                    }
                });

            }
        },  
    },
    created() {
        window.vm = this;
        this.run();
    },
    methods: {
        shouldRender(test) {
            return this.toRender[test.title];
        },
        run() {
            this.tests = [];
            const mocha = new Mocha();
            this.mocha = mocha;
            window.mocha = mocha;

            mocha.addFile('MyButton.spec.js');
            mocha.unloadFiles();
            const runner = mocha.run();

            let currTest = null;
            runner.on(constants.EVENT_TEST_BEGIN, (test) => currTest = test);
            runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

            onMount(cmp => {
                if (currTest) {
                    this.tests.push({
                        test: currTest,
                        cmp,
                        render: this.shouldRender(currTest),
                        mounted: false
                    });
                }
                // if there is no current test, then we need to check if we're inside a test hook
                // then save the component for the next text to come along
            });
        },
    }
}
</script>

<template>
<div>
    <button @click="run">Run tests</button>
    <div v-for="context in tests">
        <h2>{{ context.test.title }}</h2>
        <label>render<input type="checkbox" v-model="context.render" /></label>
        <div :ref="context.test.title"></div>
    </div>
</div>
</template>