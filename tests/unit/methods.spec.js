import { expect } from 'chai'
import VueComponent from '@/VueComponent.js';


describe('Setting methods', () => {
    const methodExists = `export default {
    methods: {
        foo() { console.log('foo rang?'); }
    }
};`;
    const bar = (val) => `export default {
    methods: {
        foo() { console.log('foo rang?'); },
        bar${val}
    }
};`;


[
    [
        'adds a method to an existing methods object',
        methodExists,
        (cmp) => cmp.setMethod('bar', '(arg1, arg2) { console.log(arg1 + arg2); }'),
        bar("(arg1, arg2) { console.log(arg1 + arg2); }")
    ],
].forEach(([name, start, action, end]) => {
        it(name, () => {
            const cmp = new VueComponent(start);
            action(cmp);
            expect(cmp.toString()).to.equal(end)
        })
    })
})