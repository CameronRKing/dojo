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


let elementHierarchyVm;

export default {
    props: ['root'],
    name: 'ElementHierarchy',
    components: {
        ElNode: {
            name: 'ElNode',
            props: ['el'],
            template: `<div class="ml-2"><span @click="select(el.el)">{{ el.name }}</span>
                <template v-if="el.children.length">
                    <ElNode v-for="(child, idx) in el.children" :el="child" :key="idx" />
                </template>
            </div>`,
            methods: {
                select(el) {
                    elementHierarchyVm.$emit('select', el);
                }
            }
        }
    },
    created() {
        elementHierarchyVm = this;
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