import Vue from 'vue'
import App from './App.vue'
import { makeRouter } from './router'
import { makeStore } from './store'

Vue.config.productionTip = false

export default function makeApp() {
    return new Vue({
        router: makeRouter(),
        store: makeStore(),
        render: h => h(App)
    });
}