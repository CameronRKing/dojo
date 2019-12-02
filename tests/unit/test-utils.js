import { mount as vueMount, shallowMount as vueShallowMount } from '@vue/test-utils';

const cmps = [];

function mount(cmp, options) {
    const wrapper = vueMount(cmp, options);
    cmps.push(wrapper);
    emit(wrapper);
    return wrapper;
}

function shallowMount(cmp, options={}) {
    const wrapper = vueShallowMount(cmp, options);
    cmps.push(wrapper);
    emit(wrapper);
    return wrapper;
}

const callbacks = [];
function onMount(cb) {
    callbacks.push(cb);
}

function emit(cmp) {
    callbacks.forEach(cb => cb(cmp));
}


export {
    mount,
    shallowMount,
    cmps,
    onMount,
}