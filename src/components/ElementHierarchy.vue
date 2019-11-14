<script>
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