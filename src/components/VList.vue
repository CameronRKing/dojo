<script>
import Mousetrap from 'mousetrap';

export default {
    props: ['list'],
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
                'bg-gray-200': this.highlighted == idx && !isSelected,
                'bg-gray-400': isSelected,
            }
        }
    }
}
</script>



<template>
<ul ref="list" class="text-left">
    <li v-for="(item, idx) in list" :class="itemClass(item, idx)" @hover="highlighted = idx" @click="selected = item">
        <slot v-bind="{ item }">{{ item }}</slot>
    </li>
</ul>
</template>