import Vue from 'vue/dist/vue.esm.js';
import Browser from './Browser.vue';

if (!document.querySelector('#vue-browser')) {
    var node = document.createElement('div')
    node.setAttribute('id', 'vue-browser')
    document.body.appendChild(node)
}

window.app = new Vue({
    el: '#vue-browser',
    render: h => h(Browser)
});