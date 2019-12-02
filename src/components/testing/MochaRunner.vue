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


export default {
    data() {
        return {
            mocha: null,
            runner: null,
            testToCmp: {},
        }
    },
    created() {
        const mocha = new Mocha();
        this.mocha = mocha;
        window.mocha = mocha;

        mocha.addFile('MyButton.spec.js');
        const runner = mocha.run();

        let currTest = null;
        runner.on(constants.EVENT_TEST_BEGIN, (test) => currTest = test);
        runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

        window.t2c = this.testToCmp;
        window.cmps = [];
        onMount(cmp => {
            cmps.push(cmp);
            console.log('running');
            if (currTest) {
                this.testToCmp[currTest.title] = cmp;
                // can't $mount directly because the component thinks it's already mounted
                this.$refs.mounter.appendChild(cmp.vm.$el);
            }
        });
    }
}
</script>



<template>
    <div id="mounter" ref="mounter">Mocha runner</div>
</template>