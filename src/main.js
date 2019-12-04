import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import './bootstrap/jscodeshift-addons';
import './bootstrap/socket';
import './bootstrap/mount';

window.root = new Vue({
  router,
  store,
  render: h => h(toMount),
}).$mount('#app')
