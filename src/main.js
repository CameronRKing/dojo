import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import './bootstrap/jscodeshift-addons';
import './bootstrap/socket';
import './bootstrap/mount';

import Mousetrap from 'mousetrap';
window.root = new Vue({
  router,
  store,
  render: h => h(toMount),
  created() {
    Mousetrap.bind('ctrl+shift+s', (e) => { e.preventDefault(); this.$socket.emit('removeDataIds', 'src/test') });
  },
}).$mount('#app')
