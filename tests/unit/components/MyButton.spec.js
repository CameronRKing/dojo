import { expect } from 'chai';
import { mount, shallowMount } from '@/../tests/unit/test-utils.js';
import MyButton from '@/components/MyButton.vue';

describe('MyButton', () => {
    it('first', () => {
        const cmp = mount(MyButton);
        expect(cmp.isVueInstance()).to.be.true;
    });
    it('new name', () => {});
});