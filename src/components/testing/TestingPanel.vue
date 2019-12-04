<script>
import fs from '@/fs-client.js';
import MochaTest from '@/ast/MochaTest.js';
import { mochaTestVue } from '@/boilerplate.js';
import MochaRunner from '@/testing/MochaRunner.js';
import Mousetrap from 'mousetrap';
import { pairs } from '@/utils.js';

function testPath(srcPath) {
    return srcPath.replace('src', 'tests/unit')
        .replace(/(\.vue|\.js)/, '.spec.js')
}

async function getTest(path) {
    let file = await fs.read(testPath(path));
    // yeah, I definitely need some kind of file abstraction to capture "Doesn't exist"
    if (typeof file == 'object' && file.code && file.code == 'ENOENT') {
        return null;
    }
    return file;
}

export default {
    props: ['path'],
    watch: {
        path: {
            immediate: true,
            async handler(newPath) {
                this.suite = null;
                let file = await getTest(newPath);
                if (file) this.suite = new MochaTest(file);
                this.setupTestShortcuts();
            }
        },
    },
    data() {
        return {
            suite: null,
            expanded: true,
            lastRunTime: 0,
            results: [],
            bindings: {
                'alt+r'() { this.expanded = false; this.$emit('blur'); },
                'h'() { this.expanded = !this.expanded; },
                'enter'() { this.suite ? this.run() : this.createSuite() },
                'a'() { this.addTest(); },
                'e'() { this.openSuite(); },
                's'() { this.suite.removeAllOnlys(); this.save(); },
            },
            boundIndices: [],
            mousetrap: null,
        }
    },
    computed: {
        running() {
            if (!this.suite) return [];
            const onlys = this.suite.tests().filter(t => t.hasOnly);
            if (onlys.length == 0) return this.suite.tests();
            return onlys;
        },
        testPath() {
            return testPath(this.path);
        },
        failing() {
            return this.results.filter(res => !res.passed).length;
        },
        passing() {
            return this.results.filter(res => res.passed).length;
        },
    },
    mounted() {
        window.vm = this;
        this.mousetrap = new Mousetrap(this.$refs.body);
        pairs(this.bindings).forEach(([shortcut, handler]) => this.mousetrap.bind(shortcut, handler.bind(this)));
    },
    unmounted() {
        pairs(this.bindings).forEach(([shortcut]) => this.mousetrap.unbind(shortcut));
        this.teardownTestShortcuts();
        this.mousetrap = null;
    },
    methods: {
        setupTestShortcuts() {
            if (!this.suite) return;
            this.suite.tests().forEach((test, idx) => {
                this.boundIndices.push(idx + 1);
                this.mousetrap.bind(`${idx+1} o`, () => this.toggleOnly(test.title));
                this.mousetrap.bind(`${idx+1} r`, () => this.renameTest(test.title));
                this.mousetrap.bind(`${idx+1} d`, () => this.deleteTest(test.title));
            });
        },
        teardownTestShortcuts() {
            this.boundIndices.forEach(idx => {
                this.mousetrap.unbind(`${idx} o`);
                this.mousetrap.unbind(`${idx} r`);
                this.mousetrap.unbind(`${idx} d`);
            });
            this.boundIndices = [];
        },
        refreshTestShortcuts() {
            this.teardownTestShortcuts();
            this.setupTestShortcuts();
        },
        createSuite() {
            return fs.write(this.testPath, mochaTestVue(this.path));
        },
        openSuite() {
            this.$emit('open', this.testPath);
        },
        save() {
            if (!this.suite) return;
            return fs.write(this.testPath, this.suite.toString());
        },
        addTest() {
            const name = window.prompt('Enter test name');
            if (!name) return;
            this.suite.addTest(name);
            this.save();
            this.refreshTestShortcuts();
        },
        renameTest(testName) {
            const name = window.prompt('Enter new test name');
            if (!name) return;
            this.suite.renameTest(testName, name);
            this.save();
        },
        toggleOnly(testName) {
            this.suite.toggleOnly(testName);
            this.save();
        },
        deleteTest(testName) {
            this.suite.deleteTest(testName);
            this.save();
            this.refreshTestShortcuts();
        },
        run() {
            const runner = new MochaRunner([this.testPath.split('unit/')[1]]);
            this.results.splice(0, this.results.length);
            let testNum = 1;
            runner.run({
                onTestStart(test) {
                    console.log(`${testNum++}) ${test.title}`);
                },
                onPass: (test, time) => {
                    console.log('    pass');
                    this.results.push({ test, time, passed: true });
                },
                onFail: (test, time, err) => {
                    console.log(err);
                    this.results.push({ test, time, err, passed: false });
                },
                onDone: (stats) => {
                    this.lastRunTime = stats.duration / 1000;
                }
            });
        },
        isRunning(test) {
            return this.running.find(r => r.title == test.title);
        },
        getTestResults(title) {
            return this.results.find(res => res.test.title == title);
        },
        getIcon(test) {
            if (!this.isRunning(test)) return 'not_interested';
            const res = this.getTestResults(test.title);
            if (!res) return 'play_circle_filled';
            if (res) return res.passed ? 'check_circle' : 'error';
        },
        isPassing(test) {
            const res = this.getTestResults(test.title);
            if (!res) return true;
            return res.passed;
        },
        focus() {
            if (!this.expanded) this.expanded = true;
            this.$refs.input.focus();
        },
        toggleExpanded() {
            console.log('toggling');
            this.expanded = !this.expanded;
        }
    }
}
</script>



<template>
<div class="fixed bottom-0 right-0 bg-gray-800 text-white p-1 z-10" ref="body">
    <div @click="toggleExpanded">
        <input class="mousetrap opacity-0 absolute" ref="input" />
        <template v-if="!suite">No test suite found</template>
        <template v-if="suite" @click="toggleExpanded">
            {{ lastRunTime }}s {{ failing }}f {{ passing }}p {{ running.length }}r {{ suite.tests().length }}t
        </template>
    </div>
    <div v-if="expanded">
        <div v-if="!suite" @click="createSuite">Create test suite</div>
        <template v-if="suite">
            <table class="w-full">
                <tr v-for="test in suite.tests()" :class="{ 'text-gray-600 italic': !isRunning(test), 'font-bold': !isPassing(test) }">
                    <td>{{ test.title }}</td>
                    <td class="text-center"><i class="material-icons">{{ getIcon(test) }}</i></td>
                </tr>
            </table>
        </template>
    </div>
</div>
</template>

