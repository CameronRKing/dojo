import { mount as vueMount, shallowMount as vueShallowMount } from '@vue/test-utils';

function mount(cmp, options) {
    const wrapper = vueMount(cmp, options);
    emit(wrapper);
    return wrapper;
}

function shallowMount(cmp, options={}) {
    const wrapper = vueShallowMount(cmp, options);
    emit(wrapper);
    return wrapper;
}

const callbacks = [];
function emit(cmp) {
    callbacks.forEach(cb => cb(cmp));
}

function onMount(cb) {
    callbacks.push(cb);
}

export {
    mount,
    shallowMount,
    onMount,
}