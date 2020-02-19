<script>
import { onMount } from './test-utils.js';
import ComponentMounter from './ComponentMounter.vue';

export default {
    components: {
        ComponentMounter,
    },
    data() {
        return {
            mocha: null,
            cmpTests: [],
            selectedTest: null,
        };
    },
    computed: {
        plainTests() {
            return this.cmpTests.map(({ test }) => test);
        }
    },
    created() {
        this.mocha = window.mocha;
        const constants = this.mocha.constructor.Runner.constants;
        const karmaReporter = this.mocha._reporter;
        const saveTest = (test, cmp) => {
            this.cmpTests.push({ test, cmp });
            if (!this.selectedTest) this.selectedTest = this.cmpTests[0];
        }

        this.mocha.reporter(class SimpleReporter {
            constructor(runner) {
                // this way we can run both reporters
                karmaReporter(runner);

                let currTest = null;
                let unclaimedCmp = null;
                runner.on(constants.EVENT_TEST_BEGIN, (test) => {
                    currTest = test;
                    if (unclaimedCmp) {
                        saveTest(test, unclaimedCmp);
                        unclaimedCmp = null;
                    }
                });
                runner.on(constants.EVENT_TEST_END, (test) => currTest = null);

                onMount(cmp => {
                    if (currTest) {
                        saveTest(currTest, cmp);
                    } else {
                        unclaimedCmp = cmp;
                    }
                });
            }
        });
    },
    methods: {
        testName(test) {
            const chain = [];
            let link = test;
            do {
                chain.push(link);
                link = link.parent;
            } while (!link.root);

            return chain.reverse()
                .map(p => p.title)
                .join(': ');
        },
        testStyle(test) {
            if (this.selectedTest == test) {
                return { width: '100%', 'background-color': 'blue', 'color': 'white' };
            }
            return {width: '100%' }
        }
    }
};
</script>

<template>
<div style="display: flex; justify-content: space-between; align-items: flex-start; ">
    <div>
        <div v-for="item in cmpTests"
            :key="testName(item.test)"
            @click="selectedTest = item"
            :style="testStyle(item)"
        >{{ testName(item.test) }}</div>
    </div>
    <div style="flex-grow: 1; display: flex; justify-content: center; align-items: flex-start">
        <ComponentMounter v-if="selectedTest" :component="selectedTest.cmp" />
    </div>
</div>
</template>