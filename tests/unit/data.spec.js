import { expect } from 'chai'
import VueComponent from '@/VueComponent.js';


describe('Adding data', () => {
    const script = (js) => `<script>${js}</script>`;
    const dataExists = `export default {
    data() {
        return {
            foo: 'foo'
        };
    }
};`;
    const bar = (val) => `export default {
    data() {
        return {
            foo: 'foo',
            bar: ${val}
        };
    }
};`;

    [[
        'adds to a string to an existing object',
        dataExists,
        (cmp) => cmp.setData('bar', 'bar'),
        bar("'bar'")
    ],
    [
        'adds a boolean to an existing object',
        dataExists,
        (cmp) => cmp.setData('bar', true),
        bar("true")
    ],
    [
        'adds a number to an existing object',
        dataExists,
        (cmp) => cmp.setData('bar', 42),
        bar("42")
    ],
    [
        'adds an object literal to an existing object',
        dataExists,
        (cmp) => cmp.setData('bar', { baz: 'baz' }),
        bar(`{
                baz: 'baz'
            }`)
    ],
    [
        'creates the data function and adds to the object if it doesnt exist',
        'export default {}',
        (cmp) => cmp.setData('foo', 'foo'),
        `export default {
    data() {
        return {
            foo: 'foo'
        };
    }
};`
    ],
    [
        'overwrites a property if it is already there',
        dataExists,
        (cmp) => cmp.setData('foo', 'updated value!'),
        `export default {
    data() {
        return {
            foo: 'updated value!'
        };
    }
};`
    ]].forEach(([name, start, action, end]) => {
        it(name, (done) => {
            const cmp = new VueComponent(script(start));
            cmp.ready().then(() => {
                action(cmp);
                expect(cmp.toString()).to.equal(script(end))
                done()
            });
        })
    })
})