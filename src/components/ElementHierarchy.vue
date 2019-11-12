<script>
// todo: get element keyboard selection working
import Mousetrap from 'mousetrap';

function isVueCmp(el) {
    return el.__vue__ !== undefined;
}

function name(el) {
    if (isVueCmp(el)) {
        return getVueCmpName(el);
    }
    return el.localName;
}

function getVueCmpName(el) {
    const path = el.__vue__.$options.path;
    if (!path) {
        return '< Anonymous: no path option set >';
    }
    return path.split('\\')
        .slice(-1)[0]
        .split('.vue')[0];
}

export default {
    props: ['root', 'highlighted', 'selected'],
    name: 'ElNode',
    computed: {
        hierarchy() {
            return this.nodeify(this.root);
        },
        list() {
            return this.listify(this.root);
        }
    },
    created() {
        const binder = Mousetrap.bind(this.$refs.list);
    },
    methods: {
        // how do I do keyboard selection of these elements?
        // I can pass down "highlighted" and "selected" props 
        nodeify(el) {
            if (el.el && el.name) {
                return el;
            }
            return {
                el,
                name: name(el),
                children: Array.from(el.children).map(c => this.nodeify(c))
            }
        },
        listify(el, nesting=0) {
            return [{ el, name: name(el), nesting }]
                .concat(Array.from(el.children).map(c => this.listify(c, nesting + 1)))
                .flat();
        }
    },
    path: __filename
};
</script>



<template>
<ul class="text-left" ref="list">
    <li v-for="({ el, name, nesting }, idx) in list"
        :style="{'padding-left': nesting * 8 + 'px'}"
        :class="{'bg-gray-200': highlighed == idx, 'bg-gray-400': selected == idx }"
    >{{ name }}</li>
</ul>
</template>