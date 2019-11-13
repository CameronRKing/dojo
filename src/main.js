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
import Editor from '@/views/Editor.vue';
import VueComponent from '@/VueComponent';
window.stories = Editor;
window.VueComponent = VueComponent;
window.fs = fs;
window.toMount = stories;
window.mt = async (cmp) => {
    if (typeof cmp == 'string') {
        toMount = (await import(`./${cmp}`)).default;
    } else {
        toMount = cmp;
    }
    root.$forceUpdate();
}


window.getCmp = async (cmp) => {
    return (await import(`./${cmp}`)).default;
}
// done
    // 1) parameterize the render function so that I can change what it returns via "mt(cmp)"
        // or "mt('path/to/cmp')"
    // 2) link a CodeMirror Vue component to the filesystem
    // 3) expose the parsers and VueComponent in the console

// what I need to do now:
    // 5) write a component for viewing stories
    // 6) write a component for editing components in stories
    // 7) figure out a simple test runner and expose it through components
        // if we can always find "cmp" and detect failures, then we can save the state of cmp on failures and mount it for quick exploration
        // either by writing them directly as components,
        // wrapping them in a calls to a DSL,
        // or manipulating them at parse time

// eventually
    // find a Vue component for interactively viewing JavaScript objects


window.root = new Vue({
  router,
  store,
  render: h => h(toMount),
  async mounted() {
    // window.editor = this.$children[0];
    // window.cmp = new VueComponent(await editor.getFile('src/App.vue'));
    // await cmp.ready()
    // cmp.setData('foo', 'bar');
    // editor.file = cmp.toString();
  }
}).$mount('#app')
