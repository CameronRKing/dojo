import { mount } from './test-utils'
import { expect } from 'chai'

describe('Sample test', () => {
    ok.init(beforeEach);

    it('works', () => {
        ok.visit('/');
    });

    it('really does work', () => {
        ok.visit('/dojos');
    })
})