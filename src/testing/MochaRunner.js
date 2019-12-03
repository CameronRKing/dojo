import { Mocha } from 'mocha';
import Runner from 'mocha/lib/runner.js';
import Suite from 'mocha/lib/suite.js';
import { onMount } from '@/../tests/unit/test-utils.js';
import SimpleReporter from './SimpleReporter.js';

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

export default class MochaRunner {
    constructor(files=[], options={}) {
        this.mocha = new Mocha({ reporter: SimpleReporter });
        // window.mocha = this.mocha;
        files.forEach(file => this.mocha.addFile(file));
        this.cmpTests = [];
    }

    run(reporterArgs={}) {
        this.cmpTests = [];
        this.mocha.reporter(SimpleReporter, reporterArgs);
        this.mocha.unloadFiles();
        const runner = this.mocha.run();

        let currTest = null;
        let unclaimedCmp = null;
        runner.on(constants.EVENT_TEST_BEGIN, (test) => {
            currTest = test;
            if (unclaimedCmp) {
                this.cmpTests.push({ test: currTest, cmp: unclaimedCmp });
                unclaimedCmp = null;
            }
        });
        runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

        onMount(cmp => {
            if (currTest) {
                this.cmpTests.push({
                    test: currTest,
                    cmp,
                });
            } else {
                unclaimedCmp = cmp;
            }
        });
    }
}