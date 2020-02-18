<script>
import Vue from 'vue/dist/vue.esm.js';

if (!document.querySelector('#vue-browser')) {
    var node = document.createElement('div')
    node.setAttribute('id', 'vue-browser')
    document.body.appendChild(node)
}

window.app = new Vue({
    el: '#vue-browser',
    template: `<h2>I'M ALIVE!</h2>`
});

export default {}
</script>