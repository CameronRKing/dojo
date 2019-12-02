<script>
import { Mocha } from 'mocha';
import Runner from 'mocha/lib/runner.js';
import Suite from 'mocha/lib/suite.js';
import { onMount } from '@/../tests/unit/test-utils.js';

const constants = Runner.constants;
var EVENT_FILE_PRE_REQUIRE = Suite.constants.EVENT_FILE_PRE_REQUIRE;
var EVENT_FILE_POST_REQUIRE = Suite.constants.EVENT_FILE_POST_REQUIRE;
var EVENT_FILE_REQUIRE = Suite.constants.EVENT_FILE_REQUIRE;

Mocha.prototype.loadFiles = function(fn) {
  var self = this;
  var suite = this.suite;
  this.files.forEach(function(file) {
    // file = path.resolve(file);
    suite.emit(EVENT_FILE_PRE_REQUIRE, global, file, self);
    suite.emit(EVENT_FILE_REQUIRE, require('@/../tests/unit/' + file), file, self);
    suite.emit(EVENT_FILE_POST_REQUIRE, global, file, self);
  });
  fn && fn();
};


// now what I need to do is link rendered components to tests

export default {
    data() {
        return {
            mocha: null,
            runner: null,
            tests: [],
        }
    },
    watch: {
        tests: {
            deep: true,
            handler(newVal) {
                const ref = test => this.$refs[test.title] && this.$refs[test.title][0];
                const mount = (context) => {
                    ref(context.test).appendChild(context.cmp.vm.$el);
                    context.mounted = true;
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
        run() {
            const mocha = new Mocha();
            this.mocha = mocha;
            window.mocha = mocha;

            mocha.unloadFiles();
            mocha.addFile('MyButton.spec.js');
            const runner = mocha.run();

            let currTest = null;
            runner.on(constants.EVENT_TEST_BEGIN, (test) => currTest = test);
            runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

            onMount(cmp => {
                if (currTest) {
                    this.tests.push({ test: currTest, cmp, render: false, mounted: false });
                }
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