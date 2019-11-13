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

function getVueParent(el) {
    let vueParent;
    let node = el;
    do {
        vueParent = node.__vue__;
        node = node.parentNode;
    } while (!vueParent && node)

    if (!vueParent) {
        throw new Error('unable to find a Vue component in the hierarchy above ' + el);
    }
    return vueParent;
}

function cmpSourcePath(cmp) {
    return cmp.$options.path.split('?')[0];
}

// performs a depth-first search
// returns an array that contains an object for each node
// object contins the element, the name of element, and its nesting depth
function listify(el, nesting=0) {
    const node = { el, name: nesting == 0 ? el.localName : name(el), nesting }; 
    return [node].concat(Array.from(el.children).map(c => listify(c, nesting + 1)))
        .flat();
}

export default {
    props: ['root'],
    data() {
        return {
            selections: [],
            highlighted: 0,
            selected: null,
        };
    },
    computed: {
        list() {
            return listify(this.root);
        }
    },
    mounted() {
        window.vm = this;
    },
    methods: {
        moveCursorUp() {
            if (this.highlighted < this.list.length - 1)
                this.highlighted++;
        },
        moveCursorDown() {
            if (this.highlighted > 0)
                this.highlighted--;
        },
        selectUnderCursor() {
            this.selected = this.list[this.highlighted];
            return this.selected;
        },
        nodeClass(node, idx) {
            const isSelected = this.selected == node;
            return {
                'bg-gray-200': this.highlighted == idx && !isSelected,
                'bg-gray-400': isSelected,
            }
        },
        async selectElement({ el }) {
            const parent = getVueParent(el);
            const path = cmpSourcePath(parent);
            this.$socket.emit('addPaletteIds', path);
            const ast = new VueComponent(await fs.read(path));
            const context = { el, parent, ast, path };
            this.selections.push(context);

            this.mode = 'edit-element';
        },
    },
    path: __filename
};
</script>



<template>
<ul>
    <li v-for="(node, idx) in list"
        :style="{'padding-left': node.nesting * 8 + 'px'}"
        :class="nodeClass(node, idx)"
    >{{ node.name }}</li>
</ul>
</template>