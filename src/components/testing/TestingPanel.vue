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
            }
        },
    },
    data() {
        return {
            suite: null,
            expanded: false,
            lastRunTime: 0,
            results: [],
            bindings: {
                'alt+r'() { this.expanded = false; this.$emit('blur'); },
                'h'() { this.expanded = !this.expanded; },
                'enter'() { this.suite ? this.run() : this.createSuite() },
                'a'() { this.addTest(); },
                'e'() { this.openSuite(); },
            },
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
        this.mousetrap = new Mousetrap(this.$refs.body);
        pairs(this.bindings).forEach(([shortcut, handler]) => this.mousetrap.bind(shortcut, handler.bind(this)));
    },
    unmounted() {
        pairs(this.bindings).forEach(([shortcut]) => this.mousetrap.unbind(shortcut));
        this.mousetrap = null;
    },
    methods: {
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
        },
        run() {
            const runner = new MochaRunner([this.testPath.split('unit/')[1]]);
            this.results.splice(0, this.results.length);
            runner.run({
                onPass: (test, time) => {
                    this.results.push({ test, time, passed: true });
                },
                onFail: (test, time, err) => {
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
        getIcon(test) {
            if (!this.isRunning(test)) return "not running";
            const res = this.results.find(res => res.test.title == test.title);
            if (!res) return "not yet run";
            if (res) return res.passed ? 'passed' : 'failed';
        },
        focus() {
            if (!this.expanded) this.expanded = true;
            this.$refs.input.focus();
        }
    }
}
</script>



<template>
<div class="fixed bottom-0 right-0 bg-gray-800 text-white p-1" ref="body">
    <div @click="expanded = !expanded">
        <input class="mousetrap opacity-0 absolute" ref="input" />
        <template v-if="!suite">No test suite found</template>
        <template v-if="suite" @click="expanded = !expanded">
            {{ lastRunTime }}s {{ failing }}f {{ passing }}p {{ running.length }}r {{ suite.tests().length }}t
        </template>
    </div>
    <div v-if="expanded">
        <div v-if="!suite" @click="createSuite">Create test suite</div>
        <template v-if="suite">
            <table class="w-full">
                <tr v-for="test in suite.tests()" :class="{ 'text-gray-600 italic': !isRunning(test) }">
                    <td>{{ test.title }}</td>
                    <td class="text-center"><i>{{ getIcon(test) }}</i></td>
                </tr>
            </table>
            <div @click="addTest" class="text-center italic">Add test</div>
            <div @click="run" class="text-center italic">Run tests</div>
        </template>
    </div>
</div>
</template>

