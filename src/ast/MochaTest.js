import j from 'jscodeshift';
import { parse, toSource } from '@/node-utils.js';

function hasOnly(testFnPath) {
    // it() is as a plain identifier
    // it.only() is a member expression
    return j.MemberExpression.check(testFnPath.get('callee'));
}

export default class MochaTest {
    constructor(text) {
        this.jSrc = j(text);
    }

    tests() {
        return this.jSrc.find(j.Identifier, { name: 'it' })
            .closest(j.CallExpression)
            .paths()
            .map(path => {
                return {
                    title: path.get('arguments', 0).get('value').value,
                    hasOnly: hasOnly(path)
                }
            });
    }

    addTest(testName) {
        this.jSrc.find(j.Identifier, { name: 'describe' })
            .closest(j.CallExpression)
            .get().value
            .arguments[1]
            .body.body
            .push(parse(`
    it('${testName}', () => {});

`));
        return this;
    }

    setTestOnly(testName) {
        const test = this.jSrc.find(j.Literal, { value: testName })
            .closest(j.CallExpression)
            .get();
        const it = test.get('callee');
        it.replace(j.memberExpression(j.identifier('it'), j.identifier('only')));
        return this;
    }

    unsetTestOnly(testName) {
        const test = this.jSrc.find(j.Literal, { value: testName })
            .closest(j.CallExpression)
            .get();
        const it = test.get('callee');
        it.replace(j.identifier('it'));    
        return this;
    }

    toString() {
        return toSource(this.jSrc);
    }
}