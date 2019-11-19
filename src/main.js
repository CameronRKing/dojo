import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import { socket, emit } from '@/socket-client';
window.socket = socket;
window.emit = emit;
Vue.use({
    install(Vue) {
        Vue.prototype.$socket = socket;
    }
});

import fs from '@/fs-client';
import CodeMirror from '@/components/CodeMirror.vue';
import HtmlEditor from '@/views/HtmlEditor.vue';
import JsEditor from '@/views/JsEditor.vue';
window.fs = fs;
window.toMount = JsEditor;
window.mt = async (cmp) => {
    if (typeof cmp == 'string') {
        toMount = await getCmp(cmp);
    } else {
        toMount = cmp;
    }
    root.$forceUpdate();
}

window.getCmp = async (cmp) => {
    return (await import(`./${cmp}`)).default;
}

import Mousetrap from 'mousetrap';

window.root = new Vue({
  router,
  store,
  render: h => h(toMount),
  created() {
    Mousetrap.bind('ctrl+shift+s', (e) => { e.preventDefault(); this.$socket.emit('removeDataIds', 'src/test') });
  },
}).$mount('#app')
