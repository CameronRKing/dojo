import Vue from 'vue';
import { socket, emit } from '@/socket-client';
window.socket = socket;
window.emit = emit;
Vue.use({
    install(Vue) {
        Vue.prototype.$socket = socket;
    }
});