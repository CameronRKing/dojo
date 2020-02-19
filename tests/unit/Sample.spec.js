import { mount } from './test-utils'
import { expect } from 'chai'

describe('Sample test', () => {
    it('works', () => {
        mount({ template: '<h1>IT WORKED!</h1>' });
        expect(true).to.equal(true)
    });

    it('really does work', () => {
        mount({ template: '<p>Am I alive?</p>' });
    })
})