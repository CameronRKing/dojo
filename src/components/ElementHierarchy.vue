<script>
function name(el) {
    if (el.__vue__) {
        return vueCmpName(el.__vue__);
    }
    return el.localName;
}

function vueCmpName(cmp) {
    if (!path(cmp)) {
        return '< Anonymous: no path option set >';
    }
    return path(cmp).split('\\')
        .slice(-1)[0]
        .split('.vue')[0];
}

// returns the path to the component's source file, if relevant
function path(cmp) {
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
            list: [],
            highlighted: 0,
            selected: null,
            selectedIdx: null,
        };
    },
    created() {
        this.updateNodeList();
    },
    methods: {
        cancelSelection() {
            this.selected = null;
            this.selectedIdx = null;
        },
        updateNodeList() {
            this.list = listify(this.root());
        },
        moveCursorUp() {
            if (this.highlighted > 0)
                this.highlighted--;
        },
        moveCursorDown() {
            if (this.highlighted < this.list.length - 1)
                this.highlighted++;
        },
        selectUnderCursor() {
            this.selectedIdx = this.highlighted;
            this.selected = this.list[this.highlighted];
            return this.selected;
        },
        updateSelection(el) {
            const idx = this.list.map(e => e.el).indexOf(el);
            this.highlighted = idx;
            this.selectedIdx = idx;
            this.selected = this.list[idx];
        },
        nodeClass(node, idx) {
            const isSelected = this.selectedIdx == idx;
            return {
                'bg-gray-200': this.highlighted == idx && !isSelected,
                'bg-gray-400': isSelected,
            }
        }
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