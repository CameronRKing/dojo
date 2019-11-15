<script>
import Mousetrap from 'mousetrap';

export default {
    props: {
        list: {},
        selectable: { default: true }
    },
    data() {
        return {
            mousetrap: null,
            highlighted: 0,
            selected: null,
        };
    },
    watch: {
        selected(newVal) {
            this.$emit('select', newVal);
        }
    },
    created() {
        this.mousetrap = new Mousetrap(this.$refs.list);
        this.mousetrap.bind('up', () => {
            if (this.highlighted > 0) this.highlighted--;
        });

        this.mousetrap.bind('down', () => {
            if (this.highlighted < this.list.length - 1) this.highlighted++;
        });

        this.mousetrap.bind('enter', () => {
            this.selected = this.list[this.highlighted];
        })
    },
    destroyed() {
        this.mousetrap.reset();
    },
    methods: {
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