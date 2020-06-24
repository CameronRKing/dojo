import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import DojoList from './views/DojoList.vue'
import DojoHome from './views/DojoHome.vue'
import LoginPage from './views/LoginPage.vue';

Vue.use(Router)

export function makeRouter() {
  return new Router({
    mode: 'history',
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/login',
        component: LoginPage
      },
      {
        path: '/dojos',
        component: DojoList
      },
      {
        path: '/dojos/:id',
        component: DojoHome,
      }
    ]
  })
}

export default makeRouter();