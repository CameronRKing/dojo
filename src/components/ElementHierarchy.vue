<script>
import VList from '@/components/VList';

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

// performs a depth-first search
// returns an array that contains an object for each node
// object contins the element, the name of element, and its nesting depth
function listify(el, nesting=0) {
    return [{ el, name: name(el), nesting }]
        .concat(Array.from(el.children).map(c => listify(c, nesting + 1)))
        .flat();
}

export default {
    components: {
        VList
    },
    props: ['root'],
    computed: {
        list() {
            return listify(this.root);
        }
    },
    path: __filename
};
</script>



<template>
<VList :list="list">
    <span slot-scope="{ item }" :style="{'padding-left': item.nesting * 8 + 'px'}">{{ item.name }}</span>
</VList>
</template>