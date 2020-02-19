import { mount } from './test-utils'
import { expect } from 'chai'

describe('Sample test', () => {
    ok.init(beforeEach);

    it('works', () => {
        ok.visit('/');
        expect(ok.containsText('Home')).to.be.ok;
    });

    it('really does work', () => {
        ok.visit('/dojos');
    })
})