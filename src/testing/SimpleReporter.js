import Mocha from 'mocha';
const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
    EVENT_TEST_BEGIN,
    EVENT_TEST_END,
} = Mocha.Mocha.Runner.constants;

export default class SimpleReporter {
    constructor(runner, { reporterOptions }) {
        const { onTestStart, onPass, onFail, onDone } = reporterOptions;
        let startTime = null;
        runner
            .on(EVENT_TEST_BEGIN, test => {
                startTime = Date.now();
                if (onTestStart) onTestStart(test);
            })
            .on(EVENT_TEST_PASS, test => {
                const time = Date.now() - startTime;
                if (onPass) onPass(test, time);
            })
            .on(EVENT_TEST_FAIL, (test, err) => {
                const time = Date.now() - startTime;
                if (onFail) onFail(test, time, err);
            })
            .once(EVENT_RUN_END, () => {
                if (onDone) onDone(runner.stats);
            })
    }
}