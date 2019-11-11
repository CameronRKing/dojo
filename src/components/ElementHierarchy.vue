<script>
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
    props: ['root'],
    name: 'ElementHierarchy',
    components: {
        ElNode: {
            name: 'ElNode',
            props: ['el', 'nesting'],
            template: `<div class="ml-2">{{ el.name }}
                <template v-if="el.children.length">
                    <ElNode v-for="child in el.children" :el="child" :nesting="nesting + 1" />
                </template>
            </div>`,
        }
    },
    computed: {
        hierarchy() {
            return this.nodeify(this.root);
        }
    },
    methods: {
        nodeify(el) {
            return {
                el,
                name: name(el),
                children: Array.from(el.children).map(c => this.nodeify(c))
            }
        },
    },
    path: __filename
};
</script>



<template>
<div class="text-left">
    <ElNode :el="hierarchy" :nesting="0" />
</div>
</template>