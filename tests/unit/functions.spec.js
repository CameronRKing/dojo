import { expect } from 'chai'
import JSUtils from '@/JSUtils.js';


describe('Manipulating functions', () => {
    const bareMethod = `export default () => 42;`;
    const withReturn = `export default () => {
    return 42;
};`
    const withArg = `export default (arg) => 42;`;
    const withDefault = `export default (arg = 107) => 42;`;
    const withTwoArgs = `export default (arg, newArg) => 42;`;


[
    [
        'adds a curly brace block and a return statement to a single-line arrow function',
        bareMethod,
        (src) => JSUtils.anonWithBody(src, 20),
        withReturn,
    ],
    [
        'convert explict object return to implicit',
        'export default () => { return {foo: "foo"}; }',
        (src) => JSUtils.anonReturnObject(src, 20),
        `export default () => ({
    foo: "foo"
});`
    ],
    [
        'converts implicit object return to explicit return',
        'export default () => ({ foo: "foo"})',
        (src) => JSUtils.anonWithBody(src, 20),
        `export default () => {
    return { foo: "foo"};
};`
    ],
    [
        'adds a first argument',
        bareMethod,
        (src) => JSUtils.fnAddArg(src, 20, 'arg'),
        withArg
    ],
    [
        'adds a second argument',
        withArg,
        (src) => JSUtils.fnAddArg(src, 20, 'newArg'),
        withTwoArgs
    ],
    [
        'removes an argument',
        withTwoArgs,
        (src) => JSUtils.fnRemoveArg(src, 20, 1),
        withArg,
    ],
    [
        'sets a default for an argument',
        withArg,
        (src) => JSUtils.fnSetDefault(src, 20, 0, 107),
        withDefault,
    ],
    [
        'updates a default for an argument',
        withDefault,
        (src) => JSUtils.fnSetDefault(src, 20, 0, {}),
        'export default (arg = {}) => 42;'
    ]
].forEach(([name, src, action, end]) => {
        it(name, () => {
            const newSrc = action(src);
            expect(newSrc).to.equal(end)
        })
    })
})