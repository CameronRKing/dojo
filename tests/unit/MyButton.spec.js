import { expect } from 'chai';
import MyButton from '@/components/MyButton.vue';
import { mount } from './test-utils.js';

describe('MyButton', () => {
    it('can be mounted directly to the DOM', () => {
        const cmp = mount(MyButton);
        expect(cmp.isVueInstance()).to.be.true;
    });
})