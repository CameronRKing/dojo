const test = require('tape');
const VueComponent = require('../../src/VueComponent.js');

[[
`export default {
    data() {
        return {
            foo: 'foo',
        };
    }
}`,
(cmp) => cmp.addData('bar', 'bar'),
`export default {
    data() {
        return {
            foo: 'foo',
            bar: 'bar',
        }
    }
}`]].forEach(([start, action, end]) => {
    test('works', function(t) {
        t.plan(1);

        const cmp = new VueComponent(start);
        action(cmp);
        t.equal(end, cmp.toString());
    })
})