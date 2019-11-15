<script>
export default {
    props: {
        list: {},
        selectable: { default: true }
    },
    data() {
        return {
            highlighted: 0,
            selected: null,
        };
    },
    methods: {
        moveCursorUp() {
            if (this.highlighted > 0) this.highlighted--;
        },
        moveCursorDown() {
            if (this.highlighted < this.list.length - 1) this.highlighted++;
        },
        selectUnderCursor() {
            this.selected = this.list[this.highlighted];
            return this.selected;
        },
        itemClass(item, idx) {
            const isSelected = this.selected == item;
            return {
                'highlighted': this.highlighted == idx && !isSelected,
                'selected': isSelected,
            }
        },
        defaultDisplay(item) {
            let str;
            try {
                // I don't understand why, but the default content was attempting to render
                // even though I had something else I wanted to display in its place
                // the default content included a reference to a Vue component instance,
                // which has at least one circular reference that errors out in JSON.stringify
                str = JSON.stringify(item);
            } catch (e) {
                return '';
            }
            return item;
        }
    }
}
</script>



<template>
<ul ref="list" class="list">
    <li v-for="(item, idx) in list" class="list-item" :class="itemClass(item, idx)" @hover="highlighted = idx" @click="selected = item">
        <slot v-bind="{ item }">{{ defaultDisplay(item) }}</slot>
    </li>
</ul>
</template>