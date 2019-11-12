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
window.fs = fs;
window.toMount = CodeMirror;
window.mt = async (cmp) => {
    if (typeof cmp == 'string') {
        toMount = (await import(`./${cmp}`)).default;
    } else {
        toMount = cmp;
    }
    root.$forceUpdate();
}

// what I need to do:
    // 1) parameterize the render function so that I can change what it returns via "mt(cmp)"
        // or "mt('path/to/cmp')"
    // 2) link a CodeMirror Vue component to the filesystem
    // 3) expose the parsers and VueComponent in the console
    // 4) find a Vue component for interactively viewing JavaScript objects
    // 5) write a component for viewing/editing stories
    // 6) write tests in a form that can be component-ized,
        // either by writing them directly as components,
        // wrapping them in a calls to a DSL,
        // or manipulating them at parse time



window.root = new Vue({
  router,
  store,
  render: h => h(toMount)
}).$mount('#app')
