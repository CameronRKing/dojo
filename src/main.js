import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
    
Vue.use({
    install(Vue) {
        Vue.prototype.$socket = io('http://localhost:3000')
    }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
