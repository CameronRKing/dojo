import {
    mount as vueMount,
    shallowMount as vueShallowMount,
    createWrapper as vueCreateWrapper,
} from '@vue/test-utils';

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

function createWrapper(cmp) {
    const wrapper = vueCreateWrapper(cmp);
    emit(wrapper);
    return wrapper;
}

// I tried const callbacks = [],
// but it wasn't being shared between the tests and onMount clients
// attaching it to the global scope works, though it's not ideal
if (!global.__test_utils_callbacks) {
    global.__test_utils_callbacks = [];
}
function emit(cmp) {
    global.__test_utils_callbacks.forEach(cb => cb(cmp));
}

function onMount(cb) {
    global.__test_utils_callbacks.push(cb);
}

export {
    mount,
    shallowMount,
    createWrapper,
    onMount,
}