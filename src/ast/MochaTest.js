import j from 'jscodeshift';
import { parse, toSource } from '@/node-utils.js';

function hasOnly(testFnPath) {
    // it() is as a plain identifier
    // it.only() is a member expression
    return j.MemberExpression.check(testFnPath.get('callee').value);
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

    renameTest(testName, newName) {
        this.jSrc.find(j.Literal, { value: testName })
            .get()
            .replace(j.literal(newName));
    }

    deleteTest(testName) {
        this.jSrc.find(j.Literal, { value: testName })
            .closest(j.ExpressionStatement)
            .get()
            .replace(null);
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

    toggleOnly(testName) {
        const test = this.jSrc.find(j.Literal, { value: testName })
            .closest(j.CallExpression)
            .get();
        hasOnly(test) ? this.unsetTestOnly(testName) : this.setTestOnly(testName);
    }

    removeAllOnlys() {
        this.jSrc.find(j.Identifier, { name: 'it' })
            .closest(j.CallExpression)
            .forEach(path => path.get('callee').replace(j.identifier('it')));
    }

    toString() {
        return toSource(this.jSrc);
    }
}