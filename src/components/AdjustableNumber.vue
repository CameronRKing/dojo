<script>
export default {
    props: ['value', 'singular', 'plural'],
    data() {
        return {
            baseValue: null,
            showHelper: false,
            clickStartX: null,
            incrementDistance: 6, // in px
            editHandler: null,
            stopHandler: null,
        }
    },
    methods: {
        startEdit(event) {
            this.clickStartX = event.pageX;
            this.baseValue = this.value;
            this.editHandler = (e) => this.editValue(e.pageX);
            this.stopHandler = () => this.stopEdit();
            // I'm not fond of getting the document directly
            // it seems to be messing with Cypress
            document.addEventListener('mousemove', this.editHandler)
            document.addEventListener('mouseup', this.stopHandler)
        },
        editValue(pageX) {
            if (this.clickStartX) {
                let newValue = this.baseValue + Math.floor((pageX - this.clickStartX) / this.incrementDistance);
                console.log(newValue);
                if (newValue < 1) newValue = 1;
                if (newValue !== this.value)
                    this.$emit('input', newValue);
            }
        },
        stopEdit() {
            this.clickStartX = null;
            this.baseValue = null;
            document.removeEventListener('mousemove', this.editHandler);
            document.removeEventListener('mouseup', this.stopHandler);
            this.editHandler = null;
            this.stopHandler = null;
        }
    }
}
</script>



<template>
    <span class="adjustable adjustable-number"
        @mouseenter="showHelper = true"
        @mouseleave="showHelper = false"
        @mousedown="startEdit"
        @mouseup="stopEdit"
    >
        <div class="adjustable-number--helper" v-show="showHelper">drag</div>
        <b style="user-select: none;">{{ value }}</b> {{ value > 1 ? plural : singular }}
    </span>
</template>

<style>

.adjustable-number:hover {
    cursor: pointer;
    cursor: col-resize;
}
.adjustable-number--helper {
    position: absolute;
    left: -9px;
    top: -13px;
}
</style>