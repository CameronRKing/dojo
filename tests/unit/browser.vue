<script>
import Vue from 'vue/dist/vue.esm.js';
import { onMount } from './test-utils.js';

if (!document.querySelector('#vue-browser')) {
    var node = document.createElement('div')
    node.setAttribute('id', 'vue-browser')
    document.body.appendChild(node)
}

window.app = new Vue({
    el: '#vue-browser',
    template: `<h2>I'M ALIVE!</h2>`,
    data: {
        mocha: null,
        tests: [],
        constants: null,
    },
    created() {
        this.mocha = window.mocha;
        const constants = this.mocha.constructor.Runner.constants;
        const karmaReporter = this.mocha._reporter;
        this.mocha.reporter(class SimpleReporter {
            constructor(runner) {
                // this way we can run both reporters
                karmaReporter(runner);

                let currTest = null;
                let unclaimedCmp = null;
                runner.on(constants.EVENT_TEST_BEGIN, (test) => {
                    console.log('test started:', test.title)
                    currTest = test;
                    if (unclaimedCmp) {
                        self.cmpTests.push({ test: currTest, cmp: unclaimedCmp });
                        unclaimedCmp = null;
                    }
                });
                runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

                onMount(cmp => {
                    if (currTest) {
                        self.cmpTests.push({
                            test: currTest,
                            cmp,
                        });
                    } else {
                        unclaimedCmp = cmp;
                    }
                });
            }
        })
    }
});

export default {}
</script>