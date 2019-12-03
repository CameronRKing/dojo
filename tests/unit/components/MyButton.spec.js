import { expect } from 'chai';
import { mount, shallowMount } from '@/../tests/unit/test-utils.js';
import MyButton from '@/components/MyButton.vue';

describe('MyButton', () => {
    it('new tests', () => {
        const cmp = mount(MyButton);
        expect(cmp.isVueInstance()).to.be.true;
    });
});